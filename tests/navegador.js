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
        const styles = await page.evaluate(sources => sources.map(source => {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(source);
            return [...sheet.cssRules].map(rule => rule.cssText);
        }), ['css/estilos.css', 'css/estilos.min.css'].map(file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')));
        assert.deepEqual(styles[1], styles[0], 'El CSS comprimido debe conservar las reglas del original');
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('main > section').count(), 9);
        assert.equal(await page.locator('#main-nav a').count(), 9);
        assert.equal(await page.locator('main > section#cumpleanos #birthday-form').count(), 1);
        assert.equal(await page.locator('#estadisticas #birthday-form').count(), 0);
        assert.equal(await page.locator('main > section#vida-personal h2').textContent(), 'Vida personal');
        // El menú no debe perder el foco al cambiar entre escritorio y tablet.
        await page.locator('#main-nav a[href="#cumpleanos"]').focus();
        await page.setViewportSize({ width: 1024, height: 1000 });
        await page.waitForFunction(() => getComputedStyle(document.querySelector('#main-nav')).display === 'none');
        assert.equal(await page.locator('.menu-toggle').evaluate(element => element === document.activeElement), true);
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.menu-toggle')).display === 'none');
        assert.equal(await page.locator('#main-nav').evaluate(element => element.contains(document.activeElement)), true);
        await page.goto(base);
        // Esperar también las imágenes diferidas, fuera del primer viewport.
        await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
        await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
        await page.screenshot({ path: path.join(output, 'escritorio.png'), fullPage: true });
        console.log('OK · nueve secciones, cumpleaños independiente y vida personal');

        assert.equal(await page.locator('.stats-ledger thead th').count(), 5);
        assert.deepEqual(await page.locator('.stats-ledger tr').filter({ has: page.locator('th[scope="row"]', { hasText: /^Partidos$/ }) }).locator('td').allTextContents(), ['778', '75', '123', '208']);
        assert.equal(await page.locator('.stats-ledger th[scope="row"]').count(), 21);
        assert.match(await page.locator('.stats-board').evaluate(element => getComputedStyle(element).fontFamily), /Arial/);
        assert.match(await page.locator('#estadisticas-title').evaluate(element => getComputedStyle(element).fontFamily), /Manrope/);
        assert.match(await page.locator('.stats-peaks').evaluate(element => getComputedStyle(element).fontFamily), /Arial/);
        const ledgerCell = page.locator('.stats-ledger tbody td').first();
        const ledgerBackground = await ledgerCell.evaluate(element => getComputedStyle(element).backgroundColor);
        await ledgerCell.hover();
        assert.equal(await ledgerCell.evaluate(element => getComputedStyle(element).backgroundColor), ledgerBackground);
        assert.equal(await page.locator('.stats-ledger thead th').first().evaluate(element => getComputedStyle(element).position), 'static');
        assert.match(await page.locator('.peak-year').textContent(), /2012/);
        assert.equal(await page.locator('.peak-year .peak-score strong').textContent(), '91');
        assert.equal(await page.locator('.peak-cup .peak-score strong').textContent(), '14');
        console.log('OK · tablón sin efectos, Arial, título Manrope y mejores ediciones');

        const momentDates = await page.locator('#momentos .moment-card time').evaluateAll(dates => dates.map(date => date.dateTime));
        assert.equal(momentDates.length, 18);
        assert.deepEqual(momentDates, [...momentDates].sort(), 'Los momentos deben mantener el orden cronológico');
        assert.equal(await page.locator('#momentos .moment-card a[target="_blank"][rel="noopener noreferrer"]').count(), 18);
        for (const link of await page.locator('.moments-index a').all()) {
            const target = await link.getAttribute('href');
            await link.focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.evaluate(() => location.hash), target);
            assert.equal(await page.locator(target).count(), 1);
        }
        assert.match(await page.locator('.moment-card h4').first().evaluate(element => getComputedStyle(element).fontFamily), /Manrope/);
        await page.locator('#momentos-comienzos').screenshot({ path: path.join(output, 'momentos-escritorio.png'), style: '.site-header, .skip-link { visibility: hidden; }' });
        console.log('OK · 18 momentos en orden, fuentes y navegación por teclado entre etapas');

        const careerTabs = page.locator('.career-route [role="tab"]');
        assert.equal(await careerTabs.count(), 4);
        for (let index = 0; index < 4; index++) {
            await careerTabs.nth(index).click();
            assert.equal(await page.locator('[data-career-panel]:visible').count(), 1);
            assert.equal(await careerTabs.nth(index).getAttribute('aria-selected'), 'true');
            assert.deepEqual(await page.locator('[data-career-panel]:visible .career-metrics dt').allTextContents(), ['partidos', 'goles', 'asistencias']);
            assert.equal(await page.locator('[data-career-panel]:visible img').evaluate(async image => { await image.decode(); return image.naturalWidth > 0; }), true);
        }
        await page.keyboard.press('Home');
        assert.equal(await careerTabs.first().getAttribute('aria-selected'), 'true');
        await page.keyboard.press('ArrowRight');
        assert.equal(await careerTabs.nth(1).getAttribute('aria-selected'), 'true');
        await page.keyboard.press('End');
        assert.equal(await careerTabs.last().getAttribute('aria-selected'), 'true');
        console.log('OK · trayectoria: cuatro equipos, imágenes y navegación por teclado');

        const biographyStages = await page.locator('.biography-stage').count();
        assert.ok(biographyStages > 0);
        const biographyIds = await page.locator('.biography-stage').evaluateAll(stages => stages.map(stage => {
            const id = stage.getAttribute('aria-labelledby');
            if (!stage.querySelector(`[id="${id}"]`)) throw new Error('La etapa debe referenciar su propio título');
            return id;
        }));
        assert.equal(new Set(biographyIds).size, biographyStages);
        for (let stage = 0; stage < biographyStages; stage++) {
            const copy = page.locator('.biography-stage:visible .biography-copy');
            assert.equal(await copy.locator(':scope > p').count(), 5);
            assert.equal(await copy.locator(':scope > h4').count(), 5);
            assert.equal(await copy.locator(':scope > h4 + p').count(), 5);
            assert.equal(await page.locator('#bio-position').textContent(), `${stage + 1} / ${biographyStages}`);
            assert.equal(await page.locator('.biography-stage:visible img').evaluate(async image => {
                await image.decode();
                return image.naturalWidth > 0;
            }), true);
            if (stage < biographyStages - 1) await page.locator('#bio-next').click();
        }
        assert.equal(await page.locator('#bio-next').isDisabled(), true);
        for (let stage = 0; stage < biographyStages - 1; stage++) await page.locator('#bio-prev').click();
        assert.equal(await page.locator('#bio-prev').isDisabled(), true);
        console.log(`OK · ${biographyStages} etapas, imágenes y referencias a sus títulos; cinco bloques por etapa`);

        assert.equal(await page.locator('.title-timeline').count(), 3);
        assert.equal(await page.locator('.title-dot').count(), 95);
        assert.equal(await page.locator('[data-timeline="clubs"] .title-dot').count(), 42);
        assert.equal(await page.locator('[data-timeline="national"] .title-dot').count(), 6);
        assert.equal(await page.locator('[data-timeline="individual"] .title-dot').count(), 47);
        assert.match(await page.locator('[data-timeline="individual"] .title-totals').textContent(), /47/);
        assert.equal(await page.locator('[data-timeline="individual"] button[aria-label*="MVP de la MLS,"][aria-label*="2026"]').count(), 0);
        const dot = page.locator('[data-timeline="individual"] .title-dot').first();
        await dot.focus();
        assert.equal(await dot.locator('..').locator('.title-tooltip').evaluate(el => getComputedStyle(el).visibility), 'visible');
        await page.keyboard.press('Escape');
        assert.equal(await dot.locator('..').locator('.title-tooltip').evaluate(el => getComputedStyle(el).visibility), 'hidden');
        await page.locator('h1').evaluate(element => { element.tabIndex = -1; element.focus(); });
        await dot.hover();
        assert.equal(await dot.locator('..').locator('.title-tooltip').evaluate(el => getComputedStyle(el).visibility), 'visible');
        await page.keyboard.press('Escape');
        assert.equal(await dot.locator('..').locator('.title-tooltip').evaluate(el => getComputedStyle(el).visibility), 'hidden', 'Escape debe cerrar también los detalles abiertos solo por hover');
        console.log('OK · líneas de tiempo, 95 títulos y premios, foco y Escape');

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
            if (width === 320) {
                const outside = await page.locator('.title-dot').evaluateAll(buttons => {
                    const failures = [];
                    for (const button of buttons) {
                        button.focus();
                        const box = button.parentElement.querySelector('.title-tooltip').getBoundingClientRect();
                        if (box.left < -1 || box.right > innerWidth + 1) failures.push(button.getAttribute('aria-label'));
                    }
                    return failures;
                });
                assert.deepEqual(outside, [], 'Los detalles de todos los puntos deben caber en móvil');
            }
            if (width === 390) {
                await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
                await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
                await page.screenshot({ path: path.join(output, 'movil.png'), fullPage: true });
                await page.locator('#momentos-argentina').screenshot({ path: path.join(output, 'momentos-movil.png'), style: '.site-header, .skip-link { visibility: hidden; }' });
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
        assert.equal(await staticPage.locator('.career-feature:visible').count(), 4);
        assert.equal(await staticPage.locator('.title-dot').count(), 95);
        assert.equal(await staticPage.locator('#momentos .moment-card:visible').count(), 18);
        await nojs.close();
        console.log('OK · lectura y navegación sin JavaScript');

        assert.deepEqual(errors, [], 'La consola y los recursos locales deben estar libres de errores');
        console.log('OK · consola sin errores ni recursos locales faltantes');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
