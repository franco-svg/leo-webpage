/* Interacciones de la página: navegación, palmarés, cumpleaños y galería. */
(() => {
    'use strict';
    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];
    document.documentElement.classList.add('js-enabled');

    function initNavigation() {
        const toggle = $('.menu-toggle');
        const nav = $('#main-nav');
        toggle.hidden = false;
        function closeMenu(returnFocus = false) {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            if (returnFocus) toggle.focus();
        }
        toggle.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(open));
            nav.classList.toggle('is-open', open);
        });
        nav.addEventListener('click', event => {
            const link = event.target.closest('a');
            if (!link) return;
            closeMenu();
            // Al cerrar el menú móvil el foco continúa en la sección elegida.
            if (matchMedia('(max-width: 52rem)').matches) {
                const heading = $(link.hash)?.querySelector('h1, h2');
                if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
            }
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
        });
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    for (const link of nav.querySelectorAll('a')) {
                        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
                        else link.removeAttribute('aria-current');
                    }
                }
            }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
            for (const section of $$('main > section')) observer.observe(section);
        }
        function revealCredits() {
            if (location.hash === '#creditos') $('#creditos').open = true;
        }
        window.addEventListener('hashchange', revealCredits);
        revealCredits();
    }

    function initHonors() {
        const buttons = $$('[data-honors]');
        const panels = $$('[data-honors-panel]');
        $('.honors-tabs').hidden = false;
        function selectHonors(value) {
            for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.honors === value));
            for (const panel of panels) panel.hidden = panel.dataset.honorsPanel !== value;
        }
        for (const button of buttons) button.addEventListener('click', () => selectHonors(button.dataset.honors));
        selectHonors('seleccion');
    }

    function initBirthday() {
        const api = globalThis.MessiBirthday;
        const archive = globalThis.MessiGoalArchive;
        const form = $('#birthday-form');
        const dayInput = $('#birthday-day');
        const monthInput = $('#birthday-month');
        const error = $('#birthday-error');
        const result = $('#birthday-result');
        const status = $('#storage-status');
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const dateLabel = (day, month) => `${day} de ${monthNames[month - 1]}`;
        let current = null;
        let storage;
        try { storage = window.localStorage; } catch { storage = null; }

        function element(tag, className, text) {
            const node = document.createElement(tag);
            if (className) node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        }
        function externalLink(text, href) {
            const link = element('a', '', text);
            link.href = href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            return link;
        }
        function renderMatches(matches) {
            const list = $('#match-list');
            list.replaceChildren();
            if (!matches.length) {
                list.append(element('p', 'no-goals', 'No hay goles registrados para esta fecha en el archivo. Siempre podés probar con otra fecha especial.'));
                return;
            }
            const fragment = document.createDocumentFragment();
            for (const match of matches) {
                const card = element('article', 'match-card');
                const [year, month, day] = match.date.split('-');
                const readableDate = `${Number(day)}/${month}/${year}`;
                card.append(element('h4', '', `${match.home} ${match.result} ${match.away}`));
                card.append(element('p', '', `${readableDate} · ${match.competition}`));
                card.append(element('p', '', `${match.total} ${match.total === 1 ? 'gol' : 'goles'} de Messi · Minutos: ${match.minutes.join(', ')}.`));
                const query = `Lionel Messi goles ${match.home} ${match.away} ${match.date}`;
                card.append(externalLink(`Buscar video del ${readableDate} ↗`, `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`));
                card.append(externalLink('Ficha del partido ↗', match.source));
                fragment.append(card);
            }
            list.append(fragment);
        }
        function showBirthday(day, month, saved = null) {
            dayInput.value = day;
            monthInput.value = month;
            current = api.findGoals(archive.goals, day, month);
            error.textContent = '';
            dayInput.removeAttribute('aria-invalid');
            monthInput.removeAttribute('aria-invalid');
            status.textContent = '';
            $('#result-date').textContent = dateLabel(current.day, current.month).toUpperCase();
            $('#result-summary').textContent = current.total === 0
                ? 'Esta fecha todavía no tiene un grito de gol.'
                : `${current.total} ${current.total === 1 ? 'gol' : 'goles'} en tu día. ${current.matches.length === 1 ? 'Un partido' : `${current.matches.length} partidos`} para recordar.`;
            renderMatches(current.matches);
            $('#birthday-name').value = saved?.name || '';
            $('#birthday-note').value = saved?.note || '';
            $('.save-details').open = false;
            result.hidden = false;
            $('#result-summary').focus({ preventScroll: true });
            result.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
        function renderSaved() {
            const state = api.readSaved(storage);
            const list = $('#saved-list');
            list.replaceChildren();
            $('#saved-dates').hidden = state.items.length === 0;
            if (!state.available) status.textContent = 'El navegador no permite guardar fechas. La consulta de goles sigue disponible.';
            for (const item of state.items) {
                const li = element('li');
                const open = element('button', 'saved-date-button', `${item.name ? `${item.name} · ` : ''}${dateLabel(item.day, item.month)}`);
                open.type = 'button';
                if (item.note) open.append(element('small', '', item.note));
                open.addEventListener('click', () => showBirthday(item.day, item.month, item));
                const remove = element('button', 'delete-date', 'Borrar');
                remove.type = 'button';
                remove.setAttribute('aria-label', `Borrar fecha del ${dateLabel(item.day, item.month)}`);
                remove.addEventListener('click', () => {
                    const response = api.removeBirthday(storage, item.day, item.month);
                    if (response.ok) {
                        renderSaved();
                        status.textContent = 'Fecha borrada de este navegador.';
                        const nextButton = $('#saved-list button') || (result.hidden ? dayInput : $('#result-summary'));
                        nextButton.focus({ preventScroll: true });
                    } else status.textContent = response.message;
                });
                li.append(open, remove);
                list.append(li);
            }
        }
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (!api.validBirthday(dayInput.value, monthInput.value)) {
                error.textContent = 'Ingresá un día y un mes válidos. Revisá cuántos días tiene ese mes.';
                dayInput.setAttribute('aria-invalid', 'true');
                monthInput.setAttribute('aria-invalid', 'true');
                result.hidden = true;
                current = null;
                (!monthInput.value ? monthInput : dayInput).focus();
                return;
            }
            showBirthday(Number(dayInput.value), Number(monthInput.value));
        });
        // Un cambio pendiente nunca permite guardar el resultado de otra fecha.
        for (const input of [dayInput, monthInput]) input.addEventListener('input', () => {
            result.hidden = true;
            current = null;
            error.textContent = '';
            status.textContent = '';
            input.removeAttribute('aria-invalid');
        });
        $('#save-birthday').addEventListener('click', () => {
            if (!current) return;
            const response = api.saveBirthday(storage, {
                day: current.day, month: current.month,
                name: $('#birthday-name').value, note: $('#birthday-note').value
            });
            if (response.ok) {
                renderSaved();
                status.textContent = 'Tu fecha quedó guardada. Podés volver a consultarla desde «Tus fechas guardadas».';
            } else status.textContent = response.message;
        });
        window.addEventListener('storage', renderSaved);
        renderSaved();
    }

    function initGallery() {
        const dialog = $('#gallery-dialog');
        if (typeof dialog.showModal !== 'function') return;
        let previousLink;
        for (const link of $$('.gallery-link')) link.addEventListener('click', event => {
            event.preventDefault();
            previousLink = link;
            $('#gallery-dialog-image').src = link.getAttribute('href');
            $('#gallery-dialog-image').alt = link.querySelector('img').alt;
            $('#gallery-dialog-caption').textContent = link.dataset.caption;
            dialog.showModal();
        });
        $('.dialog-close').addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', event => {
            if (event.target !== dialog) return;
            const box = dialog.getBoundingClientRect();
            if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
        });
        dialog.addEventListener('close', () => previousLink?.focus({ preventScroll: true }));
    }

    initNavigation();
    initHonors();
    initBirthday();
    initGallery();
})();
