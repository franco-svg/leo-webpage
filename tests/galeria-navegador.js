/* QA opcional: Playwright se utiliza solo durante el desarrollo. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;

(async () => {
    const browser = await chromium.launch({ channel: process.env.LEO_BROWSER || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const photoRequests = [];
        page.on('request', request => photoRequests.push(request.url()));
        await page.goto(url);
        const cards = page.locator('#gallery-grid > figure');
        const visible = page.locator('#gallery-grid > figure:visible');
        const total = 46;
        assert.equal(await cards.count(), total, 'La galería debe reunir cuarenta y seis fotografías');
        assert.equal(await visible.count(), 4);
        const first = await visible.first().locator('a').getAttribute('href');
        const seen = new Set();
        for (let batch = 0; batch < Math.ceil(total / 4); batch++) {
            for (const photo of await visible.locator('a').all()) seen.add(await photo.getAttribute('href'));
            await page.locator('#gallery-next').click();
        }
        assert.equal(seen.size, total, 'Las flechas deben recorrer todas las fotos sin repetir una antes de terminar');
        assert.equal(photoRequests.filter(url => /\/imagenes\/[^/]+-galeria\.jpg(?:$|[?#])/.test(url)).length, 0, 'El carrusel debe cargar miniaturas, reservando las versiones grandes para la ampliación');
        assert.equal(await visible.first().locator('a').getAttribute('href'), first, 'Al terminar se vuelve al inicio');
        await page.locator('#gallery-prev').focus();
        await page.keyboard.press('Enter');
        assert.notEqual(await visible.first().locator('a').getAttribute('href'), first);
        assert.equal(await visible.count(), 2, 'La última página de escritorio contiene las dos fotos restantes');
        const enlargedSource = await visible.first().locator('a').getAttribute('href');
        const enlarged = page.locator(`#gallery-grid a[href="${enlargedSource}"]`);
        await enlarged.click();
        assert.equal(await page.locator('#gallery-dialog').isVisible(), true);
        assert.equal(await page.locator('#gallery-dialog-image').getAttribute('src'), enlargedSource);
        await page.keyboard.press('Escape');
        assert.equal(await enlarged.evaluate(element => element === document.activeElement), true);

        for (const [width, count] of [[768, 2], [390, 1], [320, 1], [1440, 4]]) {
            await page.setViewportSize({ width, height: 844 });
            await page.waitForFunction(expected => [...document.querySelectorAll('#gallery-grid > figure')].filter(card => !card.hidden).length === expected, count);
            assert.equal(await visible.count(), count);
            await page.locator('#gallery-next').click();
            assert.equal(await visible.count(), count);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        }
        const focusedSource = await visible.last().locator('a').getAttribute('href');
        const focusedPhoto = page.locator(`#gallery-grid a[href="${focusedSource}"]`);
        await focusedPhoto.focus();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForFunction(() => [...document.querySelectorAll('#gallery-grid > figure')].filter(card => !card.hidden).length === 1);
        assert.equal(await focusedPhoto.evaluate(element => element === document.activeElement), true, 'Cambiar el ancho debe conservar visible la foto enfocada');
        assert.equal(await page.locator('#galeria .gallery-credits').count(), 0);
        assert.equal(await page.locator('#gallery-status').evaluate(element => element.getBoundingClientRect().width <= 1), true, 'El contador solo se anuncia a lectores de pantalla');
        await cards.locator('img').evaluateAll(images => {
            images.forEach(image => { image.loading = 'eager'; });
            return Promise.all(images.map(image => image.decode()));
        });
        assert.equal(await cards.locator('img').evaluateAll(images => images.every(image => image.naturalWidth > 0)), true);
        const nojs = await browser.newContext({ javaScriptEnabled: false });
        const staticPage = await nojs.newPage();
        await staticPage.goto(url);
        assert.equal(await staticPage.locator('#gallery-grid > figure:visible').count(), total);
        assert.equal(await staticPage.locator('#gallery-next').isVisible(), false);
        await nojs.close();
        console.log('OK · 46 fotos, última página incompleta, sin contador visible ni enlace inferior, recorrido circular, teclado, ampliación y foco');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
