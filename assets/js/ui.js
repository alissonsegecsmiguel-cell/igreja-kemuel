/* Interações próprias. Vídeo local é opt-in; o padrão não faz pedidos de mídia. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(root);
  // Ler a altura antes de escrever os atributos SVG evita um segundo layout síncrono.
  const overHeader = document.querySelector('.k-header--over');
  const overHeaderHeight = overHeader?.offsetHeight || 0;
  // CSS minificado pode expressar o mesmo tempo em s ou ms.
  const milliseconds = value => parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000);
  const duration = name => milliseconds(tokens.getPropertyValue('--duration-' + name));
  const easing = tokens.getPropertyValue('--ease').trim();
  const faqShift = `translateY(calc(${tokens.getPropertyValue('--tooltip-offset').trim()} * -1))`;
  const faqAnimations = new Map();
  // Loop somente no fundo da hero. Vídeo opt-in após os arquivos serem instalados.
  const assetBase = new URL('../', document.currentScript.src);
  const mobileVideo = matchMedia(`(max-width: ${parseFloat(tokens.getPropertyValue('--hero-led-media-mobile')) - .01}px)`);
  const heroes = [...document.querySelectorAll('.k-hero')];
  if ('IntersectionObserver' in window && heroes.length) {
    const visibleHeroes = new Set();
    const calmWater = new Map();
    const videos = new Map();
    function updateVideo(hero, active) {
      if (!hero.hasAttribute('data-video-enabled')) return;
      let state = videos.get(hero);
      // Sem preferência de movimento, visibilidade ou ativação: nenhuma requisição.
      if (!state && !active) return;
      if (!state) {
        const template = hero.querySelector('[data-hero-video]');
        if (!template) return;
        const video = template.content.firstElementChild.cloneNode(true);
        video.muted = true;
        state = { video, mobile: null, failed: false, playing: false };
        videos.set(hero, state);
        template.after(video);
        video.addEventListener('playing', () => {
          state.playing = true;
          hero.classList.toggle('is-video-ready', visibleHeroes.has(hero) && !reduced.matches && !document.hidden);
        });
        video.addEventListener('error', () => {
          state.failed = true;
          hero.classList.remove('is-video-ready');
        });
      }
      const { video } = state;
      if (!active) {
        video.pause();
        if (reduced.matches) hero.classList.remove('is-video-ready');
        return;
      }
      if (state.mobile !== mobileVideo.matches) {
        video.pause();
        video.replaceChildren();
        state.mobile = mobileVideo.matches;
        state.failed = false;
        state.playing = false;
        hero.classList.remove('is-video-ready');
        const sources = state.mobile ? [['hero-mobile.mp4', 'video/mp4']] : [['hero.webm', 'video/webm'], ['hero.mp4', 'video/mp4']];
        sources.forEach(([file, type]) => {
          const source = document.createElement('source');
          source.src = new URL('video/' + file, assetBase).href;
          source.type = type;
          video.append(source);
        });
        video.load();
      }
      if (!state.failed) video.play().catch(() => {
        // Autoplay recusado ou pausa concorrente: o fundo CSS continua disponível.
        if (!state.playing) hero.classList.remove('is-video-ready');
      });
    }
    const updateAtmospheres = () => heroes.forEach(hero => {
      const active = visibleHeroes.has(hero) && !reduced.matches && !document.hidden;
      hero.classList.toggle('is-atmosphere-active', active);
      updateVideo(hero, active);
      if (!active) calmWater.get(hero)?.();
    });
    const atmosphereObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleHeroes.add(entry.target);
        else visibleHeroes.delete(entry.target);
      });
      updateAtmospheres();
    }, { threshold: 0 });
    heroes.forEach(hero => atmosphereObserver.observe(hero));
    // Água: filtro só na malha; requestAnimationFrame só enquanto há ondulação.
    const fineMouse = matchMedia('(hover: hover) and (pointer: fine)');
    const waterToken = name => name === 'calm' ? milliseconds(tokens.getPropertyValue('--hero-led-water-' + name)) : parseFloat(tokens.getPropertyValue('--hero-led-water-' + name));
    heroes.forEach(hero => {
      const mesh = hero.querySelector('.k-hero-led__mesh');
      const filter = hero.querySelector('[data-hero-water]');
      if (!mesh || !filter) return;
      const noise = filter.querySelector('[data-water-noise]');
      const area = filter.querySelector('[data-water-area]');
      const soft = filter.querySelector('[data-water-soft]');
      const map = filter.querySelector('[data-water-map]');
      const radius = waterToken('radius'), calm = waterToken('calm') / 4, frequency = waterToken('frequency');
      let frame = 0, energy = 0, last = 0, lastX = null, lastY = null;
      soft.setAttribute('stdDeviation', radius / 3);
      function stop() {
        cancelAnimationFrame(frame);
        frame = 0; energy = 0; lastX = lastY = null;
        map.setAttribute('scale', 0);
        mesh.style.removeProperty('filter');
      }
      calmWater.set(hero, stop);
      function tick(now) {
        energy *= Math.exp(-(now - last) / calm);
        last = now;
        if (energy < .01) { stop(); return; }
        map.setAttribute('scale', waterToken('scale') * energy);
        noise.setAttribute('baseFrequency', frequency * (1 + waterToken('flow') * Math.sin(now / waterToken('flow-period'))));
        frame = requestAnimationFrame(tick);
      }
      hero.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || !fineMouse.matches || reduced.matches || !hero.classList.contains('is-atmosphere-active')) return;
        const box = mesh.getBoundingClientRect();
        const x = event.clientX - box.left, y = event.clientY - box.top;
        if (lastX !== null) energy = Math.min(1, energy + Math.hypot(x - lastX, y - lastY) * waterToken('gain'));
        lastX = x; lastY = y;
        // A sombra precisa da margem do desfoque; o resto do mapa fica em repouso.
        const bleed = radius * 2;
        filter.setAttribute('x', 0); filter.setAttribute('y', 0);
        filter.setAttribute('width', box.width); filter.setAttribute('height', box.height);
        [[noise, bleed], [area, radius]].forEach(([node, reach]) => {
          node.setAttribute('x', x - reach); node.setAttribute('y', y - reach);
          node.setAttribute('width', reach * 2); node.setAttribute('height', reach * 2);
        });
        if (!frame && energy > 0) {
          mesh.style.setProperty('filter', 'url(#k-hero-water)');
          last = performance.now();
          frame = requestAnimationFrame(tick);
        }
      });
    });
    reduced.addEventListener('change', updateAtmospheres);
    mobileVideo.addEventListener('change', updateAtmospheres);
    document.addEventListener('visibilitychange', updateAtmospheres);
  }
  // Cabeçalho sobre a hero: sólido assim que a hero sai de trás dele.
  if (overHeader) {
    if ('IntersectionObserver' in window && heroes.length) {
      new IntersectionObserver(([entry]) => {
        overHeader.classList.toggle('is-solid', !entry.isIntersecting);
      }, { rootMargin: `-${overHeaderHeight}px 0px 0px 0px` }).observe(heroes[0]);
    } else overHeader.classList.add('is-solid');
  }
  let toastTimer;
  function announce(message) {
    const toast = document.querySelector('[data-toast]');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.hidden = false;
    toast.textContent = message;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
  }

  document.querySelectorAll('[data-example]').forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      announce(element.hasAttribute('data-material-example') ? 'Material de exemplo. O arquivo real será publicado em breve.' : 'Exemplo de interface. Nenhum serviço externo foi aberto e nenhum dado foi enviado.');
    });
  });
  document.querySelectorAll('[aria-disabled="true"]').forEach(element => {
    element.addEventListener('click', event => event.preventDefault());
  });
  document.querySelectorAll('[data-demo-form]').forEach(form => {
    form.addEventListener('submit', event => { event.preventDefault(); announce('Formulário de demonstração: nada é enviado.'); });
  });

  document.querySelectorAll('[data-menu-toggle]').forEach(button => {
    const panel = document.getElementById(button.dataset.menuToggle);
    if (!panel) return;
    let closeTimer;
    const overlay = button.hasAttribute('data-overlay-menu');
    function setMenu(open, restore = false) {
      clearTimeout(closeTimer);
      button.setAttribute('aria-expanded', String(open));
      const label = button.querySelector('[data-menu-label]');
      if (label) {
        label.textContent = open ? 'Fechar' : 'Menu';
        button.querySelector('use')?.setAttribute('href', open ? '#k-close' : '#k-menu');
      }
      if (overlay) {
        document.body.classList.toggle('k-menu-open', open);
        document.querySelectorAll('main, .k-whatsapp, .k-endnote, .k-footer--page').forEach(el => { el.inert = open; });
      }
      panel.classList.remove('is-closing');
      if (open) {
        panel.hidden = false;
        panel.inert = false;
        panel.querySelector('a')?.focus();
      } else {
        panel.inert = true;
        if (restore) button.focus();
        if (reduced.matches) panel.hidden = true;
        else {
          panel.classList.add('is-closing');
          closeTimer = setTimeout(() => { panel.hidden = true; panel.classList.remove('is-closing'); }, duration('medium'));
        }
      }
    }
    button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true', true));
    panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, true)));
    button.closest('header, .k-mobile-demo')?.addEventListener('keydown', event => {
      if (button.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (overlay && event.key === 'Tab') {
        const links = [...panel.querySelectorAll('a')];
        const first = button, last = links.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    if (overlay) matchMedia('(min-width: 70rem)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  });

  /* Primeira visita: três ondas pausáveis; impulso finito ao abrir o FAQ. */
  document.querySelectorAll('[data-radiate]').forEach(panel => {
    const section = panel.closest('.k-spec-section');
    const pulse = panel.querySelector('.k-radiate__pulse');
    if (!section || !pulse) return;
    let visible = false;
    let impulse;
    const update = () => {
      const active = visible && !document.hidden && !reduced.matches;
      panel.classList.toggle('is-radiating', active);
      if (!active) { impulse?.cancel(); impulse = null; }
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        update();
      });
      observer.observe(section);
    }
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    section.addEventListener('k:faq-open', () => {
      if (!panel.classList.contains('is-radiating')) return;
      impulse?.cancel();
      const value = name => tokens.getPropertyValue('--faq-' + name).trim();
      impulse = pulse.animate([
        { opacity: value('pulse-opacity'), transform: `scale(${value('wave-start')})` },
        { opacity: 0, transform: `scale(${value('wave-end')})` }
      ], { duration: milliseconds(value('pulse-duration')), easing });
    });
    update();
  });

  document.querySelectorAll('.k-faq').forEach(details => {
    const summary = details.querySelector('summary');
    const body = details.querySelector('.k-faq__body');
    if (!summary || !body) return;
    const syncExpanded = () => summary.setAttribute('aria-expanded', String(details.open && details.dataset.closing !== 'true'));
    if (body.id) summary.setAttribute('aria-controls', body.id);
    syncExpanded();
    details.addEventListener('toggle', syncExpanded);
    summary.addEventListener('click', event => {
      event.preventDefault();
      faqAnimations.get(details)?.cancel();
      const opening = !details.open || details.dataset.closing === 'true';
      delete details.dataset.closing;
      if (reduced.matches) { details.open = opening; syncExpanded(); return; }
      if (opening) {
        details.open = true;
        details.dispatchEvent(new CustomEvent('k:faq-open', { bubbles: true }));
      }
      else details.dataset.closing = 'true';
      syncExpanded();
      const frames = opening
        ? [{ opacity: 0, transform: faqShift }, { opacity: 1, transform: 'none' }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: faqShift }];
      const animation = body.animate(frames, { duration: duration('medium'), easing });
      faqAnimations.set(details, animation);
      animation.onfinish = () => {
        if (!opening) details.open = false;
        delete details.dataset.closing;
        syncExpanded();
        faqAnimations.delete(details);
      };
    });
  });

  document.querySelectorAll('[data-copy]').forEach(button => {
    const label = button.querySelector('[data-copy-label]');
    const originalLabel = label?.textContent;
    let feedbackTimer;
    button.addEventListener('click', async () => {
      const field = document.getElementById(button.dataset.copy);
      if (!field) return;
      const text = (field.value || field.textContent).trim();
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        else throw new Error('clipboard');
        clearTimeout(feedbackTimer);
        button.classList.add('is-copied');
        const message = button.dataset.copyKind === 'key' ? 'Chave copiada' : button.dataset.copyKind === 'code' ? 'Código copiado' : 'Copiado · exemplo';
        if (label) label.textContent = message;
        announce(message);
        feedbackTimer = setTimeout(() => { button.classList.remove('is-copied'); if (label) label.textContent = originalLabel; }, milliseconds(tokens.getPropertyValue('--give-copy-feedback-hold')));
      } catch {
        clearTimeout(feedbackTimer);
        button.classList.remove('is-copied');
        if (label) label.textContent = originalLabel;
        field.focus?.({ preventScroll: true });
        if (field.select) field.select();
        else { const range = document.createRange(); range.selectNodeContents(field); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); }
        announce('Não foi possível copiar. O texto foi selecionado para você copiar.');
      }
    });
  });

  document.querySelectorAll('[data-open-dialog]').forEach(button => {
    button.addEventListener('click', () => document.getElementById(button.dataset.openDialog)?.showModal());
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
  });
  document.querySelectorAll('.k-tooltip').forEach(tip => {
    tip.addEventListener('keydown', event => { if (event.key === 'Escape') tip.classList.add('is-dismissed'); });
    tip.addEventListener('mouseleave', () => tip.classList.remove('is-dismissed'));
    tip.addEventListener('focusout', () => tip.classList.remove('is-dismissed'));
  });

  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const chips = [...group.querySelectorAll('[data-filter]')];
    const select = group.querySelector('[data-filter-select]');
    const items = [...group.querySelectorAll('[data-category]')];
    function filter(value) {
      chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filter === value)));
      if (select) select.value = value;
      let count = 0;
      items.forEach(item => { item.hidden = value !== 'todos' && item.dataset.category !== value; if (!item.hidden) count++; });
      const status = group.querySelector('[data-filter-count]');
      if (status) status.textContent = count + ' materiais de exemplo';
    }
    chips.forEach(chip => chip.addEventListener('click', () => filter(chip.dataset.filter)));
    select?.addEventListener('change', () => filter(select.value));
  });

  if ('IntersectionObserver' in window && !reduced.matches) {
    root.classList.add('k-motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(section => observer.observe(section));
    reduced.addEventListener('change', event => {
      if (event.matches) { observer.disconnect(); root.classList.remove('k-motion-ready'); }
    });
  }
  reduced.addEventListener('change', event => {
    if (event.matches) faqAnimations.forEach(animation => animation.finish());
  });
  document.querySelectorAll('[data-replay]').forEach(button => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.replay);
      if (!target) return;
      target.classList.remove('is-replaying');
      if (reduced.matches) { announce('Redução de movimento ativa: a demonstração permanece estática.'); return; }
      void target.offsetWidth;
      target.classList.add('is-replaying');
    });
  });

  /* História: painel completo único por capítulo; abas e acordeão responsivos. */
  function setupTimelines() {
    document.querySelectorAll('[data-timeline]').forEach((timeline, scope) => {
      const list = timeline.querySelector('[data-story-chapters]');
      const chapters = [...list.children];
      const stage = timeline.querySelector('[data-story-stage]');
      const home = timeline.querySelector('[data-story-home]');
      const canvas = stage.querySelector('[data-story-canvas]');
      const templates = [...stage.querySelectorAll('template[data-story-scene]')];
      const buttons = chapters.map(chapter => chapter.querySelector('.k-timeline-card__button'));
      const panels = chapters.map(chapter => chapter.querySelector('[data-story-panel]'));
      const status = timeline.querySelector('[data-story-status]');
      const value = name => tokens.getPropertyValue('--timeline-' + name).trim();
      const mobile = matchMedia(`(max-width: ${value('breakpoint')})`);
      const cache = new Map(), exits = new Map(), panelAnimations = new Map();
      let current = 0, currentScene = null, visible = false, readingPrepared = false;
      const syncMotion = () => timeline.classList.toggle('is-story-running', visible && !document.hidden && !reduced.matches);
      function prepareReading() {
        if (readingPrepared) return;
        readingPrepared = true;
        const style = getComputedStyle(panels[current].querySelector('.k-timeline-panel__body'));
        document.fonts.load(`${style.fontWeight} ${style.fontSize} Newsreader`).then(() => timeline.classList.add('is-timeline-font-ready'), () => {});
      }
      function hidePanel(index) {
        const panel = panels[index];
        panel.hidden = true;panel.inert = true;panel.classList.remove('is-panel-leaving');
        panel.setAttribute('aria-hidden', 'true');
        if (panel.parentNode !== chapters[index]) chapters[index].append(panel);
      }
      function settlePanels() {
        panelAnimations.forEach(animation => animation.cancel());panelAnimations.clear();
        panels.forEach((panel, index) => { if (index !== current) hidePanel(index); });
      }
      function placeStage() {
        const target = panels[current].querySelector('[data-story-slot]');
        if (stage.parentNode !== target) target.append(stage);
      }
      function syncSemantics() {
        if (mobile.matches) { list.removeAttribute('role');list.removeAttribute('aria-orientation'); }
        else { list.setAttribute('role', 'tablist');list.setAttribute('aria-orientation', 'vertical'); }
        chapters.forEach((chapter, i) => {
          const active = i === current;
          chapter.classList.toggle('is-active', active);
          if (mobile.matches) {
            chapter.removeAttribute('role');buttons[i].removeAttribute('role');buttons[i].removeAttribute('aria-selected');
            buttons[i].setAttribute('aria-expanded', String(active));buttons[i].tabIndex = 0;
            panels[i].setAttribute('role', 'region');panels[i].removeAttribute('tabindex');
          } else {
            chapter.setAttribute('role', 'presentation');buttons[i].setAttribute('role', 'tab');
            buttons[i].setAttribute('aria-selected', String(active));buttons[i].removeAttribute('aria-expanded');
            buttons[i].tabIndex = active ? 0 : -1;panels[i].setAttribute('role', 'tabpanel');panels[i].tabIndex = 0;
          }
        });
      }
      function illustration(index) {
        const template = templates.find(item => item.dataset.storyScene === chapters[index].dataset.storyArt);
        if (!template) return null;
        const scene = template.content.firstElementChild.cloneNode(true);
        // Cada instância/novo capítulo tem gradientes com IDs únicos.
        scene.querySelectorAll('[id]').forEach(node => {
          const old = node.id, id = `k-story-${scope}-${index}-${old}`;
          node.id = id;
          scene.querySelectorAll('[fill]').forEach(shape => {
            if (shape.getAttribute('fill') === `url(#${old})`) shape.setAttribute('fill', `url(#${id})`);
          });
        });
        return scene;
      }
      function getScene(index) {
        if (cache.has(index)) return cache.get(index);
        const chapter = chapters[index];
        let scene;
        // Foto é opt-in: nenhum arquivo futuro/inexistente é solicitado.
        if (chapter.dataset.storyPhoto && chapter.dataset.storyAlt) {
          const url = new URL(chapter.dataset.storyPhoto, assetBase);
          if (url.origin === location.origin) {
            scene = document.createElement('div');scene.className = 'k-story-scene k-story-scene--photo';
            const glow = document.createElement('div');glow.className = 'k-story-scene__glow';glow.setAttribute('aria-hidden', 'true');
            const art = document.createElement('div');art.className = 'k-story-scene__art';
            const image = new Image();image.className = 'k-story-scene__photo';image.alt = chapter.dataset.storyAlt;image.decoding = 'async';image.src = url.href;
            art.append(image);scene.append(glow, art);
          }
        }
        scene ||= illustration(index);
        if (!scene) return null;
        scene.setAttribute('aria-hidden', 'true');scene.inert = true;
        canvas.append(scene);cache.set(index, scene);return scene;
      }
      function showScene(index) {
        const incoming = getScene(index);
        if (!incoming) return;
        clearTimeout(exits.get(incoming));
        if (currentScene && currentScene !== incoming) {
          const leaving = currentScene;
          leaving.setAttribute('aria-hidden', 'true');leaving.inert = true;
          leaving.classList.remove('is-playing', 'is-current');leaving.classList.add('is-leaving');
          clearTimeout(exits.get(leaving));
          exits.set(leaving, setTimeout(() => leaving.classList.remove('is-leaving'), reduced.matches ? 0 : milliseconds(value('swap-duration'))));
        }
        incoming.classList.remove('is-playing', 'is-leaving');
        // Reinicia apenas por seleção manual, inclusive ao retornar a uma cena vista.
        void incoming.offsetWidth;
        incoming.classList.add('is-current');
        if (!reduced.matches && 'IntersectionObserver' in window) incoming.classList.add('is-playing');
        incoming.removeAttribute('aria-hidden');incoming.inert = false;currentScene = incoming;
        syncMotion();
      }
      function select(index, initial = false) {
        index = Math.max(0, Math.min(chapters.length - 1, index));
        const previous = current;
        settlePanels();current = index;
        const incoming = panels[current];
        const target = mobile.matches ? chapters[current] : home;
        if (incoming.parentNode !== target) target.append(incoming);
        incoming.hidden = false;incoming.inert = false;incoming.removeAttribute('aria-hidden');incoming.classList.remove('is-panel-leaving');
        placeStage();syncSemantics();
        const title = chapters[current].querySelector('.k-timeline-card__title').textContent;
        const number = `Capítulo ${String(current + 1).padStart(2, '0')}`;
        stage.querySelector('[data-story-title]').textContent = title;stage.querySelector('[data-story-number]').textContent = number;
        const animate = !initial && !reduced.matches;
        panels.forEach((panel, i) => {
          if (i === current) return;
          if (animate && !mobile.matches && i === previous && previous !== current) {
            panel.hidden = false;panel.inert = true;panel.setAttribute('aria-hidden', 'true');panel.classList.add('is-panel-leaving');
            const animation = panel.animate([
              { opacity: 1, transform: 'none' },
              { opacity: 0, transform: `translateY(calc(${value('panel-shift')} * -1))` }
            ], { duration: milliseconds(value('panel-duration')), easing });
            panelAnimations.set(panel, animation);
            animation.finished.then(() => {
              if (panelAnimations.get(panel) !== animation) return;
              if (i !== current) hidePanel(i);
              panelAnimations.delete(panel);
            }, () => {});
          } else hidePanel(i);
        });
        if (!initial) {
          prepareReading();showScene(current);status.textContent = `${number}: ${title}.`;
          if (animate) {
            const animation = incoming.animate([
              { opacity: 0, transform: `translateY(${value('panel-shift')})` },
              { opacity: 1, transform: 'none' }
            ], { duration: milliseconds(value('panel-duration')), easing });
            panelAnimations.set(incoming, animation);
            animation.finished.then(() => { if (panelAnimations.get(incoming) === animation) panelAnimations.delete(incoming); }, () => {});
          }
        }
        if (!initial && mobile.matches) {
          const rect = buttons[current].getBoundingClientRect();
          const top = document.querySelector('.k-header')?.offsetHeight || 0;
          if (rect.top < top || rect.bottom > innerHeight) buttons[current].scrollIntoView({ block: 'start', behavior: 'instant' });
        }
      }
      buttons.forEach((button, index) => {
        button.id = `${timeline.id}-capitulo-${index + 1}`;panels[index].id = `${button.id}-texto`;
        button.setAttribute('aria-controls', panels[index].id);panels[index].setAttribute('aria-labelledby', button.id);
        button.addEventListener('click', () => select(index));
        button.addEventListener('keydown', event => {
          const steps = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
          let next;
          if (event.key in steps) next = (index + steps[event.key] + chapters.length) % chapters.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = chapters.length - 1;
          else return;
          event.preventDefault();
          if (!mobile.matches) buttons.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
          buttons[next].focus({ preventScroll: true });
        });
      });
      select(0, true);timeline.classList.add('is-timeline-ready');
      mobile.addEventListener('change', () => {
        cache.forEach(scene => scene.classList.remove('is-playing'));select(current, true);
      });
      reduced.addEventListener('change', () => {
        if (reduced.matches) {
          cache.forEach(scene => scene.classList.remove('is-playing'));
          panelAnimations.forEach(animation => animation.finish());
        }
        syncMotion();
      });
      document.addEventListener('visibilitychange', syncMotion);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          visible = entries.at(-1).isIntersecting;
          if (visible) { prepareReading();if (!currentScene) showScene(current); }
          syncMotion();
        }).observe(timeline);
      } else {
        prepareReading();showScene(current);currentScene?.classList.remove('is-playing');
      }
      document.querySelectorAll('[data-story-demo]').forEach(control => {
        if (control.dataset.storyDemo !== timeline.id) return;
        control.addEventListener('click', () => { select(Number(control.dataset.storyIndex));stage.scrollIntoView({ block: 'center', behavior: 'instant' }); });
      });
    });
  }
  function deferTimelines() {
    const timeline = document.querySelector('[data-timeline]');
    if (!timeline) return;
    if ('IntersectionObserver' in window && !document.body.hasAttribute('data-design-system')) {
      const nearby = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { nearby.disconnect(); setupTimelines(); }
      }, { rootMargin: tokens.getPropertyValue('--blog-font-distance').trim() });
      nearby.observe(timeline);
      return;
    }
    if ('requestIdleCallback' in window) requestIdleCallback(setupTimelines, { timeout: duration('short') });
    else setTimeout(setupTimelines, duration('short'));
  }
  if (document.readyState === 'complete') deferTimelines();
  else addEventListener('load', deferTimelines, { once: true });

  /* Bíblia aberta: quatro páginas únicas, folha 3D e carrossel sem duplicar texto. */
  function setupBibles() {
    const value = name => tokens.getPropertyValue('--bible-' + name).trim();
    const ms = name => milliseconds(value(name + '-duration'));
    const mobile = matchMedia(`(max-width: ${value('breakpoint')})`);
    const prepareFont = section => {
      const family = tokens.getPropertyValue('--editorial-font').split(',')[0].trim();
      const weight = tokens.getPropertyValue('--weight-regular').trim();
      // O tamanho só serve ao carregamento; a composição final usa os tokens de container.
      const measure = getComputedStyle(section).fontSize;
      Promise.all([document.fonts.load(`${weight} ${measure} ${family}`), document.fonts.load(`italic ${weight} ${measure} ${family}`)])
        .then(() => section.classList.add('is-editorial-ready'));
    };
    document.querySelectorAll('.k-editorial').forEach(section => {
      if (!('IntersectionObserver' in window)) { prepareFont(section); return; }
      const observer = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting && e.intersectionRatio > 0)) { prepareFont(section); observer.disconnect(); }
      }, { threshold: .001 });
      observer.observe(section);
    });
    document.querySelectorAll('[data-bible]').forEach(book => {
      const scene = book.querySelector('[data-bible-scene]');
      const volume = book.querySelector('.k-bible__volume');
      const track = book.querySelector('[data-bible-pages]');
      const pages = [...book.querySelectorAll('[data-bible-page]')];
      const leaf = book.querySelector('[data-bible-leaf]');
      const cover = book.querySelector('.k-bible__cover');
      const ribbon = book.querySelector('.k-bible__ribbon');
      const previous = book.querySelector('[data-bible-previous]');
      const next = book.querySelector('[data-bible-next]');
      const position = book.querySelector('[data-bible-position]');
      const status = book.querySelector('[data-bible-status]');
      const dots = [...book.querySelectorAll('[data-bible-dot]')];
      const animations = new Set();
      let mounted = false, visible = false, started = false, current = 0, turning = false, generation = 0, scrollFrame = 0, pointer = null;
      const active = () => visible && !document.hidden;
      const rest = () => reduced.matches ? 'none' : `rotateX(${value('rest-angle')})`;
      const closed = () => `translateX(${value('enter-shift')}) rotateX(${value('enter-angle')}) rotateZ(${value('enter-rotate')})`;
      function motion(target, frames, time, delay = 0) {
        const animation = target.animate(frames, { duration: time, delay, easing, fill: 'both' });
        animations.add(animation);
        if (!active()) animation.pause();
        animation.finished.then(() => { animations.delete(animation); animation.cancel(); }, () => animations.delete(animation));
        return animation;
      }
      function stop() { generation++; animations.forEach(a => a.cancel()); animations.clear(); turning = false; }
      function syncMotion() {
        animations.forEach(a => { if (reduced.matches) a.finish(); else if (active()) a.play(); else a.pause(); });
      }
      function update(announce = false) {
        const last = mobile.matches ? pages.length - 1 : 1;
        previous.disabled = current === 0; next.disabled = current === last;
        const label = mobile.matches ? `Página ${current + 1} de ${pages.length}` : `Páginas ${current ? '3 e 4' : '1 e 2'} de ${pages.length}`;
        position.textContent = label;
        if (announce) status.textContent = label + '.';
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
        pages.forEach((page, i) => { page.inert = mobile.matches ? i !== current : current ? i < 2 : i > 1; });
        if (next.disabled && document.activeElement === next) previous.focus({ preventScroll: true });
        else if (previous.disabled && document.activeElement === previous) next.focus({ preventScroll: true });
      }
      async function openBook() {
        if (started || !visible) return;
        started = true;
        if (mobile.matches || reduced.matches) { book.dataset.bibleState = 'open'; return; }
        const run = generation;
        const start = closed();
        book.dataset.bibleState = 'opening';
        motion(volume, [{ transform: start }, { transform: rest() }], ms('open'));
        const opened = motion(cover, [
          { transform: `translateZ(${value('cover-depth')}) rotateY(0deg)`, opacity: 1 },
          { transform: `translateZ(${value('cover-depth')}) rotateY(${value('cover-angle')})`, opacity: 0 }
        ], ms('open'));
        ['.k-bible__pages', '.k-bible__leather--left', '.k-bible__edge--left', '.k-bible__spine', '.k-bible__ribbon'].forEach(selector => motion(book.querySelector(selector), [{ opacity: 0 }, { opacity: 1 }], ms('enter'), duration('short')));
        try { await opened.finished; } catch { return; }
        if (run !== generation) return;
        book.dataset.bibleState = 'open';
        if (!reduced.matches) motion(ribbon, [
          { transform: `translateZ(${value('ribbon-depth')}) rotate(${value('ribbon-start')})` },
          { transform: `translateZ(${value('ribbon-depth')}) rotate(${value('ribbon-middle')})`, offset: .35 },
          { transform: `translateZ(${value('ribbon-depth')}) rotate(${value('ribbon-end')})`, offset: .65 },
          { transform: `translateZ(${value('ribbon-depth')}) rotate(0deg)` }
        ], ms('ribbon'));
      }
      function mountLayout() {
        mounted = true;
        stop(); cancelAnimationFrame(scrollFrame); scrollFrame = 0;
        book.dataset.bibleEnhanced = '';
        current = 0; book.classList.remove('is-turned'); track.scrollLeft = 0;
        if (mobile.matches) pages.forEach(page => track.insertBefore(page, leaf));
        else { leaf.append(pages[1], pages[2]); }
        started = mobile.matches || reduced.matches || started;
        book.dataset.bibleState = started ? 'open' : 'closed';
        book.querySelector('[data-bible-controls]').hidden = false;
        book.querySelector('[data-bible-dots]').hidden = !mobile.matches;
        update(); if (visible) openBook();
      }
      async function change(index) {
        const last = mobile.matches ? pages.length - 1 : 1;
        if (index < 0 || index > last || index === current || turning) return;
        if (!started || book.dataset.bibleState !== 'open') { stop(); started = true; book.dataset.bibleState = 'open'; }
        if (mobile.matches) {
          current = index; update(true);
          track.scrollTo({ left: pages[index].offsetLeft - pages[0].offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth' });
          return;
        }
        const from = current ? value('turn-angle') : '0deg';
        current = index; book.classList.toggle('is-turned', !!current); update(true);
        if (!reduced.matches && visible) {
          turning = true; const run = generation;
          try { await motion(leaf, [{ transform: `rotateY(${from})` }, { transform: `rotateY(${current ? value('turn-angle') : '0deg'})` }], ms('turn')).finished; } catch { return; }
          if (run === generation) turning = false;
        }
      }
      previous.addEventListener('click', () => change(current - 1));
      next.addEventListener('click', () => change(current + 1));
      dots.forEach((dot, i) => dot.addEventListener('click', () => change(i)));
      book.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); change(current + (event.key === 'ArrowRight' ? 1 : -1));
      });
      track.addEventListener('scroll', () => {
        if (!mobile.matches || scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          const nearest = pages.reduce((best, page, i) => Math.abs(page.offsetLeft - pages[0].offsetLeft - track.scrollLeft) < Math.abs(pages[best].offsetLeft - pages[0].offsetLeft - track.scrollLeft) ? i : best, 0);
          if (current !== nearest) { current = nearest; update(true); }
        });
      }, { passive: true });
      scene.addEventListener('pointerdown', event => {
        if (mobile.matches || !event.isPrimary || event.button !== 0 || event.target.closest('a, button')) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      });
      scene.addEventListener('pointermove', event => {
        if (!pointer || event.pointerId !== pointer.id) return;
        if (Math.abs(event.clientX - pointer.x) >= Number(value('swipe-distance'))) scene.setPointerCapture(event.pointerId);
      }, { passive: true });
      scene.addEventListener('pointerup', event => {
        if (!pointer || event.pointerId !== pointer.id) return;
        const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null;
        if (Math.abs(dx) >= Number(value('swipe-distance')) && Math.abs(dx) > Math.abs(dy) * Number(value('swipe-axis-ratio'))) change(current + (dx < 0 ? 1 : -1));
      });
      scene.addEventListener('pointercancel', () => { pointer = null; });
      book.querySelector('[data-bible-replay]').addEventListener('click', () => {
        stop(); started = false; current = 0; book.classList.remove('is-turned'); track.scrollLeft = 0; update(true);
        book.dataset.bibleState = mobile.matches || reduced.matches ? 'open' : 'closed';
        scene.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'center' });
        openBook();
      });
      mobile.addEventListener('change', () => { if (mounted) mountLayout(); });
      reduced.addEventListener('change', () => { if (reduced.matches) { stop(); started = true; book.dataset.bibleState = 'open'; } });
      document.addEventListener('visibilitychange', syncMotion);
      if ('IntersectionObserver' in window) {
        const nearby = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) { if (!mounted) mountLayout(); nearby.disconnect(); }
        }, { rootMargin: value('mount-distance') });
        nearby.observe(scene);
        const observer = new IntersectionObserver(entries => {
          const entry = entries.at(-1); visible = entry.isIntersecting && entry.intersectionRatio > 0;
          if (visible && !mounted) mountLayout();
          book.classList.toggle('is-in-view', visible); syncMotion(); if (visible) openBook();
        }, { threshold: .001 });
        observer.observe(scene);
      } else { visible = true; started = true; mountLayout(); book.dataset.bibleState = 'open'; }
    });
    // A URL é gerada do JSON. Nenhuma conexão com Google até perto do mapa.
    const loadMap = frame => { if (!frame.hasAttribute('src')) frame.src = frame.dataset.src; };
    document.querySelectorAll('[data-map-lazy]').forEach(frame => {
      if (!('IntersectionObserver' in window)) return; // O link externo permanece utilizável.
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { loadMap(frame); observer.disconnect(); }
      }, { rootMargin: value('map-distance') });
      observer.observe(frame);
    });
  }
  // Fora do primeiro paint; dados de serviço/endereço são HTML estático.
  function deferBibles() {
    if ('requestIdleCallback' in window) requestIdleCallback(setupBibles, { timeout: duration('long') });
    else setTimeout(setupBibles, duration('short'));
  }
  if (document.readyState === 'complete') deferBibles();
  else addEventListener('load', deferBibles, { once: true });

  // Dobra de blog: filtro por tema; atualiza cards, nota e aviso para leitores de tela.
  document.querySelectorAll('[data-blog]').forEach(blog => {
    const prepareFont = () => {
      const family = tokens.getPropertyValue('--editorial-font').split(',')[0].trim();
      document.fonts.load(`italic ${tokens.getPropertyValue('--weight-regular').trim()} ${getComputedStyle(blog).fontSize} ${family}`)
        .then(() => blog.classList.add('is-blog-ready'));
    };
    if ('IntersectionObserver' in window) {
      const nearby = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { prepareFont(); nearby.disconnect(); }
      }, { rootMargin: tokens.getPropertyValue('--blog-font-distance').trim() });
      nearby.observe(blog);
    } else prepareFont();
    const chips = [...blog.querySelectorAll('[data-blog-filter]')];
    const cards = [...blog.querySelectorAll('[data-blog-category]')];
    const grid = blog.querySelector('.k-blog-grid');
    const count = blog.querySelector('[data-blog-count]');
    const status = blog.querySelector('[data-blog-status]');
    chips.forEach(chip => chip.addEventListener('click', () => {
      const value = chip.dataset.blogFilter;
      chips.forEach(item => item.setAttribute('aria-pressed', String(item === chip)));
      let shown = 0;
      grid.classList.toggle('is-filtered', value !== 'todos');
      cards.forEach(card => {
        const visible = value === 'todos' || card.dataset.blogCategory === value;
        card.hidden = !visible;
        card.classList.toggle('k-blog-card--featured', visible && shown === 0);
        card.classList.remove('is-entering');
        if (visible) { shown++; if (!reduced.matches) { void card.offsetWidth; card.classList.add('is-entering'); } }
      });
      if (count) count.textContent = String(shown).padStart(2, '0');
      if (status) status.textContent = `${shown} ${shown === 1 ? 'reflexão' : 'reflexões'}${value === 'todos' ? '' : ' em ' + chip.querySelector('span').textContent}.`;
    }));
  });

  document.querySelectorAll('.k-materials-section[data-reveal]').forEach(section => {
    const prepare = () => {
      const family = tokens.getPropertyValue('--editorial-font').split(',')[0].trim();
      const size = getComputedStyle(section).fontSize;
      document.fonts.load(`italic ${tokens.getPropertyValue('--weight-regular').trim()} ${size} ${family}`)
        .then(() => section.classList.add('is-materials-ready'));
    };
    if ('IntersectionObserver' in window) {
      const nearby = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { prepare(); nearby.disconnect(); } }, { rootMargin: tokens.getPropertyValue('--materials-font-distance').trim() });
      nearby.observe(section);
    } else prepare();
  });

  document.querySelectorAll('[data-materials]').forEach(group => {
    const filters = [...group.querySelectorAll('[data-material-filter]')];
    const cards = [...group.querySelectorAll('[data-material-category]')];
    filters.forEach(button => button.addEventListener('click', () => {
      let count = 0;
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      cards.forEach(card => { card.hidden = button.dataset.materialFilter !== 'todos' && card.dataset.materialCategory !== button.dataset.materialFilter; if (!card.hidden) count++; });
      group.querySelectorAll('[data-material-section]').forEach(section => { section.hidden = ![...section.querySelectorAll('[data-material-category]')].some(card => !card.hidden); });
      group.querySelector('[data-material-count]').textContent = `${count} ${count === 1 ? 'material' : 'materiais'}`;
    }));
  });

  // Contribua: entrada finita e inclinação somente com mouse; sem movimento contínuo.
  document.querySelectorAll('[data-give-manifesto]').forEach(section => {
    const prepare = () => {
      const family = tokens.getPropertyValue('--editorial-font').split(',')[0].trim();
      const weight = tokens.getPropertyValue('--weight-regular').trim();
      document.fonts.load(`italic ${weight} ${getComputedStyle(section).fontSize} ${family}`).then(() => section.classList.add('is-give-ready'));
    };
    if ('IntersectionObserver' in window) {
      const nearby = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { prepare(); nearby.disconnect(); } }, { rootMargin: tokens.getPropertyValue('--give-font-distance').trim() });
      nearby.observe(section);
    } else prepare();
    const coin = section.querySelector('[data-give-coin]');
    const tilt = coin?.querySelector('.k-give-coin__tilt');
    if (!coin || !tilt) return;
    let active = false, pending = false, point, loaded = false, loading = false;
    const reset = () => { tilt.style.transform = 'none'; };
    const startEntry = () => { if (active && loaded) coin.classList.add('is-coin-ready'); };
    const prepareImage = () => {
      if (loading) return;
      loading = true;
      coin.querySelector('img').decode().then(() => { loaded = true; startEntry(); }).catch(() => {});
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => { active = entries[0].isIntersecting; if (active) { prepareImage(); startEntry(); } else reset(); });
      observer.observe(coin);
    } else { active = true; prepareImage(); }
    coin.addEventListener('pointermove', event => {
      if (!active || reduced.matches || event.pointerType !== 'mouse') return;
      point = { x: event.clientX, y: event.clientY };
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (!active || reduced.matches) return;
        const box = coin.getBoundingClientRect();
        const x = (point.x - box.left - box.width / 2) / (box.width / 2), y = (point.y - box.top - box.height / 2) / (box.height / 2);
        const norm = Math.max(1, Math.hypot(x, y));
        const max = parseFloat(tokens.getPropertyValue('--give-coin-max-tilt'));
        tilt.style.transform = `perspective(${tokens.getPropertyValue('--give-coin-perspective').trim()}) rotateX(${-y / norm * max}deg) rotateY(${x / norm * max}deg)`;
      });
    });
    coin.addEventListener('pointerleave', reset); reduced.addEventListener('change', reset);
  });
  document.querySelectorAll('[data-give-group]').forEach(group => {
    const buttons = [...group.querySelectorAll('[data-goal-select]')];
    const pix = group.querySelector('[data-pix]');
    const mobile = matchMedia(`(max-width: ${parseFloat(tokens.getPropertyValue('--give-mobile-breakpoint')) - .01}px)`);
    buttons.forEach(button => button.addEventListener('click', () => {
      const selected = button.getAttribute('aria-pressed') !== 'true';
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button && selected)));
      pix.querySelector('[data-pix-default]').hidden = selected;
      pix.querySelector('[data-pix-target]').hidden = !selected;
      pix.querySelector('[data-pix-title]').textContent = selected ? button.dataset.goalTitle : '';
      pix.querySelector('[data-pix-code]').textContent = selected ? button.dataset.goalCode : '';
      pix.querySelector('[data-pix-code-copy]').hidden = !selected;
      if (mobile.matches && selected) pix.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    }));
    const updateSticky = () => { const clearance = parseFloat(getComputedStyle(pix).scrollMarginTop); pix.classList.toggle('is-sticky', !mobile.matches && pix.offsetHeight <= innerHeight - clearance * 2); };
    if ('ResizeObserver' in window) new ResizeObserver(updateSticky).observe(pix);
    addEventListener('resize', updateSticky); updateSticky();
    const animations = new Set(), seen = new WeakSet();
    function show(card, index) {
      if (seen.has(card)) return;
      seen.add(card);
      if (reduced.matches) return;
      const bar = card.querySelector('[data-goal-progress]');
      const number = card.querySelector('[data-goal-number]');
      const target = Number(bar.getAttribute('aria-valuenow'));
      const fill = bar.querySelector('.k-progress__fill');
      const animation = fill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: milliseconds(tokens.getPropertyValue('--give-progress-duration')), delay: index * milliseconds(tokens.getPropertyValue('--give-progress-stagger')), easing, fill: 'both' });
      animations.add(animation); number.textContent = '0';
      const tick = () => {
        if (reduced.matches) { animation.finish(); number.textContent = target; animations.delete(animation); return; }
        const progress = animation.effect.getComputedTiming().progress || 0;
        number.textContent = Math.round(target * progress);
        if (animation.playState === 'finished') { number.textContent = target; animations.delete(animation); }
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    const cards = [...group.querySelectorAll('[data-goal-card]')];
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { show(entry.target, cards.indexOf(entry.target)); observer.unobserve(entry.target); } }));
      cards.forEach(card => observer.observe(card));
    }
    reduced.addEventListener('change', () => { if (reduced.matches) animations.forEach(animation => animation.finish()); });
  });

  // Hero: faísca na borda dos horários (um único timer para os dois cards) e destaque do próximo culto.
  // Começa no tempo ocioso para não pesar no carregamento; a etiqueta só usa visibility, sem deslocar nada.
  const whenIdle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
  document.querySelectorAll('.k-schedule--glint').forEach(list => whenIdle(() => {
    const cards = [...list.querySelectorAll('.k-schedule__item--glint')];
    if (!cards.length) return;
    // Próximo culto no fuso da igreja; depois do horário de início, conta o seguinte.
    const zone = list.dataset.timezone || 'America/Fortaleza';
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(part => [part.type, part.value]));
    const now = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday) * 1440 + Number(parts.hour) * 60 + Number(parts.minute);
    const until = card => { const [h, m] = card.dataset.time.split(':').map(Number); const at = Number(card.dataset.weekday) * 1440 + h * 60 + m; return (at - now + 10080) % 10080 || 10080; };
    const next = cards.reduce((best, card) => until(card) < until(best) ? card : best);
    next.classList.add('is-next');
    // Reinicia pelas próprias animações (sem forçar layout); o pulso do ponto segue sozinho.
    const glint = (targets, now) => targets.forEach(card => {
      card.classList.toggle('is-glint-now', Boolean(now));
      if (!card.classList.contains('is-glinting')) return card.classList.add('is-glinting');
      card.getAnimations({ subtree: true }).forEach(a => { if (a.animationName !== 'k-glint-pulse') { a.cancel(); a.play(); } });
    });
    let timer = 0, visible = true;
    const interval = milliseconds(tokens.getPropertyValue('--schedule-glint-interval')) || 7000;
    const stop = () => { clearInterval(timer); timer = 0; };
    const start = () => {
      if (timer || reduced.matches || document.hidden || !visible) return;
      glint(cards);
      timer = setInterval(() => glint(cards), interval);
    };
    const hero = list.closest('.k-hero') || list;
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop(); }).observe(hero);
    else start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    reduced.addEventListener('change', () => (reduced.matches ? stop() : start()));
    cards.forEach(card => ['pointerenter', 'focusin'].forEach(type => card.addEventListener(type, () => { if (!reduced.matches) glint([card], true); })));
  }));

  // /discipulado: contador (uma vez, ao entrar na tela), jornada, vídeos de exemplo, fachada do YouTube e vídeo de fundo.
  const easeOut = (() => {
    // cubic-bezier(.22, 1, .36, 1), o easing do projeto, resolvido por Newton.
    const [x1, y1, x2, y2] = [.22, 1, .36, 1];
    const bez = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    return x => { let t = x; for (let i = 0; i < 6; i++) { const d = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t; if (!d) break; t -= (bez(t, x1, x2) - x) / d; } return bez(Math.min(1, Math.max(0, t)), y1, y2); };
  })();
  document.querySelectorAll('[data-counter]').forEach(counter => {
    const value = counter.querySelector('[data-counter-value]');
    const total = Number(value?.textContent);
    if (!value || !Number.isFinite(total) || reduced.matches || !('IntersectionObserver' in window)) return;
    const length = milliseconds(tokens.getPropertyValue('--discipleship-counter-duration')) || 1600;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const step = now => {
        const progress = Math.min(1, (now - start) / length);
        value.textContent = String(Math.round(total * easeOut(progress)));
        if (progress < 1) requestAnimationFrame(step);
      };
      value.textContent = '0';
      requestAnimationFrame(step);
    }, { threshold: .4 });
    observer.observe(counter);
  });
  document.querySelectorAll('[data-journey]').forEach(journey => {
    const marker = journey.querySelector('[data-journey-marker]');
    if (!marker) return;
    let visible = false, pending = false;
    const update = () => {
      pending = false;
      const box = journey.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight / 2 - box.top) / box.height));
      marker.style.transform = `translateY(${progress * (box.height - marker.offsetHeight)}px)`;
    };
    const schedule = () => { if (visible && !pending && !reduced.matches) { pending = true; requestAnimationFrame(update); } };
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(journey);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
  });
  const playWhenVisible = (elements, on, off) => {
    if (!('IntersectionObserver' in window)) return;
    const visible = new Set();
    const sync = () => elements.forEach(el => (visible.has(el) && !reduced.matches && !document.hidden ? on : off)(el));
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)); sync(); }, { threshold: 0 });
    elements.forEach(el => observer.observe(el));
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
  };
  playWhenVisible([...document.querySelectorAll('[data-video-example]')], el => el.classList.add('is-playing'), el => el.classList.remove('is-playing'));
  playWhenVisible([...document.querySelectorAll('[data-bg-video]')], video => video.play().catch(() => {}), video => video.pause());
  document.querySelectorAll('[data-video-id]').forEach(button => {
    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(button.dataset.videoId)}?autoplay=1`;
      frame.title = button.dataset.videoTitle;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      button.replaceWith(frame);
      frame.focus();
    });
  });

  // Post do blog: barra de progresso de leitura (só transform) e cópia do link.
  const readingBar = document.querySelector('[data-reading-progress] span');
  const article = document.querySelector('.k-article');
  if (readingBar && article) {
    let pending = false;
    const updateReading = () => {
      pending = false;
      const box = article.getBoundingClientRect();
      const total = box.height - innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, -box.top / total)) : 1;
      readingBar.style.transform = `scaleX(${ratio})`;
    };
    addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(updateReading); } }, { passive: true });
    addEventListener('resize', updateReading);
    updateReading();
  }
  document.querySelectorAll('[data-share-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.url || location.href);
        announce('Link copiado.');
      } catch {
        announce('Não foi possível copiar. Copie o endereço na barra do navegador.');
      }
    });
  });

  /* Manual vivo: estas rotinas só são executadas na documentação. */
  if (!document.body.hasAttribute('data-design-system')) return;
  const stateNames = { normal: 'Normal', hover: 'Hover', active: 'Ativo', focus: 'Foco', disabled: 'Desabilitado' };
  document.querySelectorAll('[data-states]').forEach(gallery => {
    const template = gallery.querySelector('template');
    if (!template) return;
    Object.entries(stateNames).forEach(([state, name]) => {
      if (gallery.dataset.states && !gallery.dataset.states.split(' ').includes(state)) return;
      const cell = document.createElement('div'); cell.className = 'k-state';
      const caption = document.createElement('span'); caption.className = 'k-caption'; caption.textContent = name;
      const fragment = template.content.cloneNode(true);
      const control = fragment.firstElementChild;
      control.dataset.state = state;
      if (state === 'disabled') {
        if ('disabled' in control) control.disabled = true;
        else { control.setAttribute('aria-disabled', 'true'); control.tabIndex = -1; }
      }
      if (control.tagName === 'A') control.addEventListener('click', e => e.preventDefault());
      cell.append(caption, fragment); gallery.append(cell);
    });
  });
  function measureTypes() {
    document.querySelectorAll('[data-type]').forEach(row => {
      const sample = row.querySelector('[data-type-preview]');
      const destination = row.querySelector('[data-type-metrics]');
      if (!sample || !destination) return;
      const style = getComputedStyle(sample);
      const n = number => Math.round(parseFloat(number) * 100) / 100;
      destination.textContent = `${style.fontFamily.split(',')[0].replaceAll('"', '')} · ${style.fontWeight} · ${n(style.fontSize)}px / ${n(style.lineHeight)}px · tracking ${style.letterSpacing} · ${style.textTransform === 'uppercase' ? 'CAIXA ALTA' : 'caixa natural'}`;
    });
  }
  document.fonts.ready.then(measureTypes);
  addEventListener('resize', measureTypes);

  function rgba(value) {
    const parts = value.match(/[\d.]+/g).map(Number);
    return [...parts.slice(0, 3), parts[3] ?? 1];
  }
  function toHex(values) { return '#' + values.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(); }
  function hsl([r, g, b]) {
    [r, g, b] = [r / 255, g / 255, b / 255];
    const high = Math.max(r, g, b), low = Math.min(r, g, b), delta = high - low;
    const light = (high + low) / 2;
    let hue = 0, sat = 0;
    if (delta) {
      sat = delta / (1 - Math.abs(2 * light - 1));
      hue = high === r ? ((g - b) / delta) % 6 : high === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    }
    return `${Math.round((hue * 60 + 360) % 360)}°, ${Math.round(sat * 100)}%, ${Math.round(light * 100)}%`;
  }
  const palette = {
    red: 'Primária e acento · ações e detalhes · PROVISÓRIO', 'red-hover': 'Ação em hover; links sobre claro', 'red-active': 'Ação pressionada; texto de erro',
    black: 'Superfície preta e contraste', white: 'Base clara; texto sobre escuro', neutral: 'Texto secundário sobre claro', 'neutral-light': 'Texto secundário sobre escuro',
    'surface-soft': 'Seções e painéis claros', 'surface-dark': 'Seção escura', 'surface-raised': 'Painel sobre escuro', text: 'Texto principal sobre claro',
    border: 'Divisores decorativos', 'border-control': 'Contorno de controles', 'border-dark': 'Divisores sobre escuro', disabled: 'Texto desabilitado', 'disabled-surface': 'Superfície desabilitada',
    success: 'Sucesso · somente feedback', 'success-surface': 'Fundo de feedback de sucesso', warning: 'Aviso · somente feedback', 'warning-surface': 'Fundo de feedback de aviso', error: 'Erro · somente feedback', 'error-surface': 'Fundo de feedback de erro',
    'red-a08': 'Vermelho a 8% sobre branco · detalhe', 'red-a16': 'Vermelho a 16% sobre branco · detalhe', 'black-a08': 'Preto a 8% sobre branco · detalhe', 'black-a60': 'Preto a 60% · sobreposição mínima de fotos', 'white-a12': 'Branco a 12% sobre preto · luz', 'white-a06': 'Branco a 6% sobre preto · luz'
  };
  const paletteRoot = document.querySelector('[data-palette]');
  if (paletteRoot) Object.entries(palette).forEach(([name, role]) => {
    const item = document.createElement('div'); item.className = 'k-palette-item';
    const swatch = document.createElement('div'); swatch.className = 'k-swatch k-swatch--' + name;
    item.append(swatch); paletteRoot.append(item);
    // O valor vem do token; os swatches alpha mostram a composição sobre a base.
    const token = tokens.getPropertyValue('--color-' + name).trim();
    const actual = token.startsWith('#') ? [...hexRGB(token), 1] : rgba(token);
    const title = document.createElement('strong'); title.textContent = '--color-' + name;
    const value = document.createElement('code');
    const hex = toHex(actual.slice(0, 3)) + (actual[3] < 1 ? Math.round(actual[3] * 255).toString(16).padStart(2, '0').toUpperCase() : '');
    value.textContent = `${hex} · rgb(${actual.slice(0, 3).join(', ')}) · hsl(${hsl(actual)})${actual[3] < 1 ? ' · alpha ' + actual[3] : ''}`;
    const text = document.createElement('p'); text.textContent = role;
    item.append(title, value, text);
  });

  const pairs = [
    ['Texto principal', 'text', 'white'], ['Texto em seção clara', 'text', 'surface-soft'], ['Texto secundário', 'neutral', 'white'], ['Apoio em seção clara', 'neutral', 'surface-soft'],
    ['Branco sobre preto', 'white', 'black'], ['Branco em seção escura', 'white', 'surface-dark'], ['Branco em painel escuro', 'white', 'surface-raised'],
    ['Apoio sobre preto', 'neutral-light', 'black'], ['Apoio em seção escura', 'neutral-light', 'surface-dark'], ['Apoio em painel escuro', 'neutral-light', 'surface-raised'],
    ['Botão primário', 'white', 'red'], ['Botão primário: hover', 'white', 'red-hover'], ['Botão primário: ativo', 'white', 'red-active'],
    ['Link no claro', 'red-hover', 'white'], ['Link em seção clara', 'red-hover', 'surface-soft'], ['Link: hover', 'red-active', 'white'],
    ['Botão claro', 'text', 'white'], ['Botão claro: hover', 'text', 'disabled-surface'], ['Botão claro: ativo', 'text', 'border'],
    ['Controle desabilitado', 'disabled', 'disabled-surface'], ['Link desabilitado', 'disabled', 'white'],
    ['Sucesso', 'success', 'success-surface'], ['Sucesso em formulário', 'success', 'white'], ['Aviso', 'warning', 'warning-surface'], ['Aviso sobre branco', 'warning', 'white'],
    ['Erro', 'error', 'error-surface'], ['Erro em formulário', 'error', 'white'], ['Badge neutro', 'text', 'surface-soft'],
    ['Foto: pior caso com preto a 60%', 'white', '#666666']
  ];
  function hexRGB(hex) { return hex.match(/[\da-f]{2}/gi).map(v => parseInt(v, 16)); }
  function tokenRGB(name) { return hexRGB(name.startsWith('#') ? name : tokens.getPropertyValue('--color-' + name).trim()); }
  function luminance(rgb) {
    const linear = rgb.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  }
  const contrastRoot = document.querySelector('[data-contrast]');
  window.kemuelContrastResults = pairs.map(([role, foreground, background]) => {
    const a = tokenRGB(foreground), b = tokenRGB(background);
    const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
    const ratio = (high + .05) / (low + .05);
    const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Revisar';
    if (contrastRoot) {
      const row = document.createElement('tr');
      [role, toHex(a) + ' / ' + toHex(b), ratio.toFixed(2) + ':1', level].forEach(value => {
        const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
      });
      contrastRoot.append(row);
    }
    return { role, foreground: toHex(a), background: toHex(b), ratio, level };
  });
  window.kemuelReady = true;
})();
