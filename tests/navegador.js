/* QA opcional con Playwright instalado en el entorno de desarrollo, nunca en el sitio. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const base = process.env.LEO_TEST_URL || 'http://127.0.0.1:4173';
const output = path.join(__dirname, '../test-results');
fs.mkdirSync(output, { recursive: true });

(async () => {
    const browser = await chromium.launch({ channel: process.env.LEO_BROWSER || 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) errors.push(`${response.status()} ${response.url()}`); });
    try {
        await page.goto(base);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('main > section').count(), 7);
        assert.equal(await page.locator('#main-nav a').count(), 7);
        // Esperar también las imágenes diferidas, fuera del primer viewport.
        await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
        await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
        await page.screenshot({ path: path.join(output, 'escritorio.png'), fullPage: true });
        console.log('OK · siete secciones, recursos y vista de escritorio');

        assert.equal(await page.locator('.title-timeline').count(), 2);
        assert.equal(await page.locator('.title-dot').count(), 46);
        const dot = page.locator('.title-dot').first();
        await dot.focus();
        assert.equal(await dot.locator('..').locator('.title-tooltip').evaluate(el => getComputedStyle(el).visibility), 'visible');
        await page.keyboard.press('Escape');
        assert.equal(await dot.locator('..').locator('.title-tooltip').evaluate(el => getComputedStyle(el).visibility), 'hidden');
        console.log('OK · líneas de tiempo, 46 títulos, foco y Escape');

        await page.locator('#birthday-day').fill('31');
        await page.locator('#birthday-month').selectOption('4');
        await page.locator('.birthday-submit').click();
        assert.match(await page.locator('#birthday-error').textContent(), /válidos/);
        assert.equal(await page.locator('#birthday-result').isVisible(), false);
        await page.locator('#birthday-day').fill('18');
        await page.locator('#birthday-month').selectOption('12');
        await page.locator('.birthday-submit').click();
        assert.match(await page.locator('#result-summary').textContent(), /5 goles/);
        assert.equal(await page.locator('.match-card').count(), 3);
        assert.match(await page.locator('.match-card').first().textContent(), /23, 108/);
        assert.match(await page.locator('.match-card a').first().getAttribute('href'), /youtube\.com\/results/);
        await page.locator('.save-details summary').click();
        await page.locator('#birthday-name').fill('<img src=x onerror=alert(1)>');
        await page.locator('#birthday-note').fill('Mi recuerdo del Mundial');
        await page.locator('#save-birthday').click();
        assert.equal(await page.locator('#saved-list li').count(), 1);
        assert.equal(await page.locator('#saved-list img').count(), 0);
        await page.reload();
        await page.locator('.saved-date-button').click();
        assert.match(await page.locator('#result-summary').textContent(), /5 goles/);
        assert.equal(await page.locator('#birthday-note').inputValue(), 'Mi recuerdo del Mundial');
        await page.screenshot({ path: path.join(output, 'cumpleanos.png'), fullPage: false });
        await page.locator('.delete-date').click();
        assert.equal(await page.locator('#result-summary').evaluate(element => element === document.activeElement), true, 'Al borrar la última fecha el foco debe continuar en un elemento visible');
        await page.reload();
        assert.equal(await page.locator('#saved-list li').count(), 0);
        console.log('OK · validación, suma, agrupación, enlaces, guardado, recarga, texto seguro y borrado');

        await page.locator('#birthday-day').fill('18');
        await page.locator('#birthday-month').selectOption('12');
        await page.locator('.birthday-submit').click();
        await page.locator('.save-details summary').click();
        await page.locator('#birthday-name').fill('W'.repeat(40));
        await page.locator('#save-birthday').click();
        await page.setViewportSize({ width: 320, height: 844 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Los nombres largos guardados deben ajustarse en móvil');
        await page.locator('.delete-date').click();
        console.log('OK · nombres largos guardados sin desbordar en 320px');

        await page.locator('#birthday-day').fill('24');
        await page.locator('#birthday-month').selectOption('6');
        await page.locator('.birthday-submit').click();
        assert.match(await page.locator('#result-summary').textContent(), /no tiene/);
        assert.equal(await page.locator('.match-card').count(), 0);
        await page.locator('#birthday-day').fill('29');
        await page.locator('#birthday-month').selectOption('2');
        await page.locator('.birthday-submit').click();
        assert.match(await page.locator('#result-summary').textContent(), /3 goles/);
        console.log('OK · fecha sin goles y 29 de febrero');

        const gallery = page.locator('.gallery-link').first();
        await gallery.click();
        assert.equal(await page.locator('#gallery-dialog').isVisible(), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#gallery-dialog').isVisible(), false);
        assert.equal(await gallery.evaluate(element => element === document.activeElement), true);
        console.log('OK · galería, Escape y devolución del foco');

        for (const width of [320, 390, 768, 1024, 1440]) {
            await page.setViewportSize({ width, height: 844 });
            await page.goto(base);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Desborde horizontal en ${width}px`);
            if (width === 390) {
                await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
                await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
                await page.screenshot({ path: path.join(output, 'movil.png'), fullPage: true });
                await page.locator('.menu-toggle').click();
                assert.equal(await page.locator('#main-nav').isVisible(), true);
                await page.keyboard.press('Escape');
                assert.equal(await page.locator('#main-nav').isVisible(), false);
                await page.locator('.menu-toggle').click();
                await page.locator('#main-nav a[href="#estadisticas"]').click();
                assert.equal(await page.locator('#main-nav').isVisible(), false);
            }
        }
        console.log('OK · anchos 320, 390, 768, 1024 y 1440; menú móvil por teclado');

        const blocked = await browser.newContext();
        await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
        const blockedPage = await blocked.newPage();
        await blockedPage.goto(base);
        await blockedPage.locator('#birthday-day').fill('18');
        await blockedPage.locator('#birthday-month').selectOption('12');
        await blockedPage.locator('.birthday-submit').click();
        await blockedPage.locator('.save-details summary').click();
        await blockedPage.locator('#save-birthday').click();
        assert.match(await blockedPage.locator('#storage-status').textContent(), /no permite guardar/);
        assert.match(await blockedPage.locator('#result-summary').textContent(), /5 goles/);
        await blocked.close();
        console.log('OK · almacenamiento bloqueado sin romper la consulta');

        const offline = await browser.newContext({ offline: true, javaScriptEnabled: true });
        const filePage = await offline.newPage();
        await filePage.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
        await filePage.locator('#birthday-day').fill('18');
        await filePage.locator('#birthday-month').selectOption('12');
        await filePage.locator('.birthday-submit').click();
        assert.match(await filePage.locator('#result-summary').textContent(), /5 goles/);
        assert.equal(await filePage.locator('.hero-photo img').evaluate(img => img.complete && img.naturalWidth > 0), true);
        await offline.close();
        console.log('OK · index.html con file:// sin conexión');

        const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
        const staticPage = await nojs.newPage();
        await staticPage.goto(base);
        assert.equal(await staticPage.locator('#main-nav').isVisible(), true);
        assert.equal(await staticPage.locator('.title-dot').count(), 46);
        await nojs.close();
        console.log('OK · lectura y navegación sin JavaScript');

        assert.deepEqual(errors, [], 'La consola y los recursos locales deben estar libres de errores');
        console.log('OK · consola sin errores ni recursos locales faltantes');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
