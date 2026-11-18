/* Interacciones de la página: navegación, palmarés, cumpleaños y galería. */
(() => {
    'use strict';
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    document.documentElement.classList.add('js-enabled');

    function initNavigation() {
        const toggle = $('.menu-toggle');
        const nav = $('#main-nav');
        const compactNavigation = matchMedia('(max-width: 68rem)');
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
        nav.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;
            closeMenu();
            // Al cerrar el menú móvil el foco continúa en la sección elegida.
            if (compactNavigation.matches) {
                const heading = $(link.hash)?.querySelector('h1, h2');
                if (heading) {
                    heading.tabIndex = -1;
                    heading.focus({ preventScroll: true });
                }
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
        });
        compactNavigation.addEventListener('change', (event) => {
            if (event.matches) {
                // El enlace enfocado se ocultará al adoptar el menú compacto.
                if (!nav.classList.contains('is-open') && nav.contains(document.activeElement)) {
                    toggle.focus({ preventScroll: true });
                }
            } else {
                const returnFocus = document.activeElement === toggle;
                closeMenu();
                if (returnFocus)
                    nav.querySelector('[aria-current]')?.focus({ preventScroll: true });
            }
        });
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (!entry.isIntersecting) continue;
                        for (const link of nav.querySelectorAll('a')) {
                            if (link.hash === `#${entry.target.id}`)
                                link.setAttribute('aria-current', 'location');
                            else link.removeAttribute('aria-current');
                        }
                    }
                },
                { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
            );
            for (const section of $$('main > section')) observer.observe(section);
        }
    }

    function initHonors() {
        for (const point of $$('.title-point')) {
            const button = point.querySelector('button');
            button.addEventListener('click', () => {
                const open = button.getAttribute('aria-expanded') !== 'true';
                button.setAttribute('aria-expanded', String(open));
                point.classList.toggle('is-open', open);
                point.classList.toggle('is-dismissed', !open);
            });
            button.addEventListener('focus', () => point.classList.remove('is-dismissed'));
            point.addEventListener('pointerenter', () => point.classList.remove('is-dismissed'));
            point.addEventListener('focusout', () => {
                point.classList.remove('is-open');
                button.setAttribute('aria-expanded', 'false');
            });
        }
        // Hover no mueve el foco: Escape debe funcionar desde cualquier elemento.
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            for (const point of $$('.title-point')) {
                point.classList.add('is-dismissed');
                point.classList.remove('is-open');
                point.querySelector('button').setAttribute('aria-expanded', 'false');
            }
        });
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
        const monthNames = [
            'enero',
            'febrero',
            'marzo',
            'abril',
            'mayo',
            'junio',
            'julio',
            'agosto',
            'septiembre',
            'octubre',
            'noviembre',
            'diciembre',
        ];
        const dateLabel = (day, month) => `${day} de ${monthNames[month - 1]}`;
        let current = null;
        let storage;
        try {
            storage = window.localStorage;
        } catch {
            storage = null;
        }

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
                list.append(element('p', 'no-goals', 'No hay goles registrados para esta fecha.'));
                return;
            }
            const fragment = document.createDocumentFragment();
            for (const match of matches) {
                const card = element('article', 'match-card');
                const [year, month, day] = match.date.split('-');
                const readableDate = `${Number(day)}/${month}/${year}`;
                card.append(element('h4', '', `${match.home} ${match.result} ${match.away}`));
                card.append(element('p', '', `${readableDate} · ${match.competition}`));
                card.append(
                    element(
                        'p',
                        '',
                        `${match.total} ${match.total === 1 ? 'gol' : 'goles'} de Messi · Minutos: ${match.minutes.join(', ')}.`,
                    ),
                );
                const query = `Lionel Messi goles ${match.home} ${match.away} ${match.date}`;
                card.append(
                    externalLink(
                        `Buscar video del ${readableDate} ↗`,
                        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
                    ),
                );
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
            $('#result-summary').textContent =
                current.total === 0
                    ? 'Esta fecha no tiene goles registrados.'
                    : `${current.total} ${current.total === 1 ? 'gol' : 'goles'} en tu día. ${current.matches.length === 1 ? 'Un partido' : `${current.matches.length} partidos`}.`;
            renderMatches(current.matches);
            $('#birthday-name').value = saved?.name || '';
            $('#birthday-note').value = saved?.note || '';
            $('.save-details').open = false;
            result.hidden = false;
            $('#result-summary').focus({ preventScroll: true });
            result.scrollIntoView({
                block: 'nearest',
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
            });
        }
        function renderSaved() {
            const state = api.readSaved(storage);
            const list = $('#saved-list');
            list.replaceChildren();
            $('#saved-dates').hidden = state.items.length === 0;
            if (!state.available)
                status.textContent =
                    'El navegador no permite guardar fechas. La consulta de goles sigue disponible.';
            for (const item of state.items) {
                const li = element('li');
                const open = element(
                    'button',
                    'saved-date-button',
                    `${item.name ? `${item.name} · ` : ''}${dateLabel(item.day, item.month)}`,
                );
                open.type = 'button';
                if (item.note) open.append(element('small', '', item.note));
                open.addEventListener('click', () => showBirthday(item.day, item.month, item));
                const remove = element('button', 'delete-date', 'Borrar');
                remove.type = 'button';
                remove.setAttribute(
                    'aria-label',
                    `Borrar fecha del ${dateLabel(item.day, item.month)}`,
                );
                remove.addEventListener('click', () => {
                    const response = api.removeBirthday(storage, item.day, item.month);
                    if (response.ok) {
                        renderSaved();
                        status.textContent = 'Fecha borrada de este navegador.';
                        const nextButton =
                            $('#saved-list button') ||
                            (result.hidden ? dayInput : $('#result-summary'));
                        nextButton.focus({ preventScroll: true });
                    } else status.textContent = response.message;
                });
                li.append(open, remove);
                list.append(li);
            }
        }
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!api.validBirthday(dayInput.value, monthInput.value)) {
                error.textContent =
                    'Ingresá un día y un mes válidos. Revisá cuántos días tiene ese mes.';
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
        for (const input of [dayInput, monthInput])
            input.addEventListener('input', () => {
                result.hidden = true;
                current = null;
                error.textContent = '';
                status.textContent = '';
                input.removeAttribute('aria-invalid');
            });
        $('#save-birthday').addEventListener('click', () => {
            if (!current) return;
            const response = api.saveBirthday(storage, {
                day: current.day,
                month: current.month,
                name: $('#birthday-name').value,
                note: $('#birthday-note').value,
            });
            if (response.ok) {
                renderSaved();
                status.textContent =
                    'Tu fecha quedó guardada. Podés volver a consultarla desde «Tus fechas guardadas».';
            } else status.textContent = response.message;
        });
        window.addEventListener('storage', renderSaved);
        renderSaved();
    }

    function initGallery() {
        const carousel = $('.gallery-carousel');
        const photos = $$('#gallery-grid > figure');
        if (carousel && photos.length) {
            const phone = window.matchMedia('(max-width: 36rem)');
            const tablet = window.matchMedia('(max-width: 60rem)');
            let first = 0;
            const pageSize = () => (phone.matches ? 1 : tablet.matches ? 2 : 4);
            function showPhotos() {
                const count = pageSize();
                first = Math.floor(first / count) * count;
                photos.forEach((photo, index) => {
                    photo.hidden = index < first || index >= first + count;
                    if (!photo.hidden) photo.querySelector('img').loading = 'eager';
                });
                $('#gallery-status').textContent =
                    `${first + 1}–${Math.min(first + count, photos.length)} / ${photos.length}`;
            }
            function move(direction) {
                const count = pageSize();
                const pages = Math.ceil(photos.length / count);
                first = ((Math.floor(first / count) + direction + pages) % pages) * count;
                showPhotos();
            }
            $('#gallery-prev').addEventListener('click', () => move(-1));
            $('#gallery-next').addEventListener('click', () => move(1));
            function resizePhotos() {
                const focused = photos.findIndex((photo) => photo.contains(document.activeElement));
                if (focused >= 0) first = focused;
                showPhotos();
            }
            for (const breakpoint of [phone, tablet])
                breakpoint.addEventListener('change', resizePhotos);
            carousel.classList.add('is-ready');
            for (const control of $$('.gallery-arrow, #gallery-status')) control.hidden = false;
            showPhotos();
        }
        const dialog = $('#gallery-dialog');
        if (typeof dialog.showModal !== 'function') return;
        let previousLink;
        for (const link of $$('.gallery-link'))
            link.addEventListener('click', (event) => {
                event.preventDefault();
                previousLink = link;
                $('#gallery-dialog-image').src = link.getAttribute('href');
                $('#gallery-dialog-image').alt = link.querySelector('img').alt;
                $('#gallery-dialog-caption').textContent = link.dataset.caption;
                dialog.showModal();
            });
        $('.dialog-close').addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', (event) => {
            if (event.target !== dialog) return;
            const box = dialog.getBoundingClientRect();
            if (
                event.clientX < box.left ||
                event.clientX > box.right ||
                event.clientY < box.top ||
                event.clientY > box.bottom
            )
                dialog.close();
        });
        dialog.addEventListener('close', () => {
            const returnTarget = previousLink?.closest('figure').hidden
                ? $('#gallery-next')
                : previousLink;
            returnTarget?.focus({ preventScroll: true });
        });
    }

    function initBiography() {
        const stages = $$('.biography-stage');
        let position = 0;
        const previous = $('#bio-prev');
        const next = $('#bio-next');
        $('.biography-controls').hidden = false;
        function show() {
            stages.forEach((stage, index) => {
                stage.hidden = index !== position;
            });
            previous.disabled = position === 0;
            next.disabled = position === stages.length - 1;
            $('#bio-position').textContent = `${position + 1} / ${stages.length}`;
            // Mantener el foco en un control habilitado al llegar a un extremo.
            if (document.activeElement === previous && previous.disabled) next.focus();
            if (document.activeElement === next && next.disabled) previous.focus();
        }
        previous.addEventListener('click', () => {
            position = Math.max(0, position - 1);
            show();
        });
        next.addEventListener('click', () => {
            position = Math.min(stages.length - 1, position + 1);
            show();
        });
        show();
    }

    function initCareer() {
        const route = $('.career-route');
        const tabs = $$('[data-career]');
        const panels = $$('[data-career-panel]');
        route.hidden = false;
        route.setAttribute('role', 'tablist');
        function select(index, focus = false) {
            tabs.forEach((tab, current) => {
                tab.setAttribute('aria-selected', String(current === index));
                tab.tabIndex = current === index ? 0 : -1;
                panels[current].hidden = current !== index;
            });
            if (focus) tabs[index].focus({ preventScroll: true });
        }
        tabs.forEach((tab, index) => {
            tab.setAttribute('role', 'tab');
            panels[index].setAttribute('role', 'tabpanel');
            panels[index].setAttribute('aria-labelledby', tab.id);
            panels[index].tabIndex = 0;
            tab.addEventListener('click', () => select(index));
            tab.addEventListener('keydown', (event) => {
                const target = {
                    ArrowRight: (index + 1) % tabs.length,
                    ArrowLeft: (index + tabs.length - 1) % tabs.length,
                    Home: 0,
                    End: tabs.length - 1,
                }[event.key];
                if (target === undefined) return;
                event.preventDefault();
                select(target, true);
            });
        });
        select(0);
    }

    initCareer();
    initBiography();
    initNavigation();
    initHonors();
    initBirthday();
    initGallery();
})();
