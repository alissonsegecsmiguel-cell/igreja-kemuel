/* Interações próprias. Vídeo local é opt-in; o padrão não faz pedidos de mídia. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(root);
  const duration = name => parseFloat(tokens.getPropertyValue('--duration-' + name));
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
    const waterToken = name => parseFloat(tokens.getPropertyValue('--hero-led-water-' + name));
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
  const overHeader = document.querySelector('.k-header--over');
  if (overHeader) {
    if ('IntersectionObserver' in window && heroes.length) {
      new IntersectionObserver(([entry]) => {
        overHeader.classList.toggle('is-solid', !entry.isIntersecting);
      }, { rootMargin: `-${overHeader.offsetHeight}px 0px 0px 0px` }).observe(heroes[0]);
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
      announce('Exemplo de interface. Nenhum serviço externo foi aberto e nenhum dado foi enviado.');
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
      if (opening) details.open = true;
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
    button.addEventListener('click', async () => {
      const field = document.getElementById(button.dataset.copy);
      if (!field) return;
      const text = field.value || field.textContent;
      const label = button.querySelector('[data-copy-label]');
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        else { field.focus(); field.select(); if (!document.execCommand('copy')) throw new Error('clipboard'); }
        button.classList.add('is-copied');
        if (label) label.textContent = 'Copiado · exemplo';
        announce('Marcador de demonstração copiado. Não é uma chave PIX real.');
      } catch {
        field.focus(); field.select?.();
        announce('Selecione e copie o texto do campo. Ele é apenas um marcador de demonstração.');
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

  /* História: capítulos lidos do HTML, um palco, cenas finitas e brilho pausável. */
  function setupTimelines() {
    document.querySelectorAll('[data-timeline]').forEach((timeline, scope) => {
      const chapters = [...timeline.querySelector('[data-story-chapters]').children];
      const stage = timeline.querySelector('[data-story-stage]');
      const home = timeline.querySelector('[data-story-home]');
      const canvas = stage.querySelector('[data-story-canvas]');
      const templates = [...stage.querySelectorAll('template[data-story-scene]')];
      const buttons = chapters.map(chapter => chapter.querySelector('.k-timeline-card__button'));
      const panels = chapters.map(chapter => chapter.querySelector('.k-timeline-card__panel'));
      const status = timeline.querySelector('[data-story-status]');
      const mobile = matchMedia(`(max-width: ${parseFloat(tokens.getPropertyValue('--timeline-breakpoint')) - .01}px)`);
      const cache = new Map(), exits = new Map(), panelAnimations = new Set();
      let current = 0, currentScene = null, visible = false;
      const value = name => tokens.getPropertyValue('--timeline-' + name).trim();
      const syncMotion = () => timeline.classList.toggle('is-story-running', visible && !document.hidden && !reduced.matches);
      function placeStage() {
        const target = mobile.matches ? chapters[current].querySelector('[data-story-slot]') : home;
        if (stage.parentNode !== target) target.append(stage);
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
          exits.set(leaving, setTimeout(() => leaving.classList.remove('is-leaving'), reduced.matches ? 0 : parseFloat(value('swap-duration'))));
        }
        incoming.classList.remove('is-playing', 'is-leaving');
        // Reinicia apenas por seleção manual, inclusive ao retornar a uma cena vista.
        void incoming.offsetWidth;
        incoming.classList.add('is-current');
        if (!reduced.matches && 'IntersectionObserver' in window) incoming.classList.add('is-playing');
        incoming.removeAttribute('aria-hidden');incoming.inert = false;currentScene = incoming;
        syncMotion();
      }
      function select(index, focus = false, initial = false) {
        index = Math.max(0, Math.min(chapters.length - 1, index));
        panelAnimations.forEach(animation => animation.cancel());panelAnimations.clear();
        current = index;
        // Mover antes de recolher evita prender o palco num painel oculto.
        placeStage();
        chapters.forEach((chapter, i) => {
          chapter.classList.toggle('is-active', i === current);
          buttons[i].setAttribute('aria-expanded', String(i === current));panels[i].hidden = i !== current;
        });
        const title = chapters[current].querySelector('.k-timeline-card__title').textContent;
        const number = `Capítulo ${String(current + 1).padStart(2, '0')}`;
        stage.querySelector('[data-story-title]').textContent = title;
        stage.querySelector('[data-story-number]').textContent = number;
        if (!initial) {
          showScene(current);status.textContent = `${number}: ${title}.`;
          if (!reduced.matches) {
            const animation = panels[current].animate([
              { opacity: 0, transform: `translateY(${value('panel-shift')})` },
              { opacity: 1, transform: 'none' }
            ], { duration: parseFloat(value('panel-duration')), easing });
            panelAnimations.add(animation);animation.finished.then(() => panelAnimations.delete(animation), () => panelAnimations.delete(animation));
          }
        }
        if (focus) buttons[current].focus({ preventScroll: true });
        if (!initial && mobile.matches) {
          const rect = buttons[current].getBoundingClientRect();
          const top = document.querySelector('.k-header')?.offsetHeight || 0;
          if (rect.top < top || rect.bottom > innerHeight) buttons[current].scrollIntoView({ block: 'start', behavior: 'instant' });
        }
      }
      buttons.forEach((button, index) => {
        // A quantidade e os destinos vêm da lista; funciona com 3 a 6 capítulos.
        button.id = `${timeline.id}-capitulo-${index + 1}`;panels[index].id = `${button.id}-texto`;
        button.setAttribute('aria-controls', panels[index].id);panels[index].setAttribute('aria-labelledby', button.id);
        button.addEventListener('click', () => select(index));
        button.addEventListener('keydown', event => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();select(index + (event.key === 'ArrowDown' ? 1 : -1), true);
        });
      });
      select(0, false, true);timeline.classList.add('is-timeline-ready');
      mobile.addEventListener('change', () => {
        // Reorganizar a tela não recomeça as animações de capítulo.
        cache.forEach(scene => scene.classList.remove('is-playing'));placeStage();
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
          if (visible && !currentScene) showScene(current);
          syncMotion();
        }).observe(stage);
      } else {
        showScene(current);currentScene?.classList.remove('is-playing');
      } // Sem observador: cena final, sem loop.
      document.querySelectorAll('[data-story-demo]').forEach(control => {
        if (control.dataset.storyDemo !== timeline.id) return;
        control.addEventListener('click', () => {
          select(Number(control.dataset.storyIndex));stage.scrollIntoView({ block: 'center', behavior: 'instant' });
        });
      });
    });
  }
  function deferTimelines() {
    if (!document.querySelector('[data-timeline]')) return;
    if ('requestIdleCallback' in window) requestIdleCallback(setupTimelines, { timeout: duration('short') });
    else setTimeout(setupTimelines, duration('short'));
  }
  if (document.readyState === 'complete') deferTimelines();
  else addEventListener('load', deferTimelines, { once: true });

  /* Livro editorial: camadas preguiçosas, abertura única e navegação manual.
     Técnica de camadas/folha/gestos adaptada do projeto próprio Caderninho;
     geometria, aparência e comportamento reescritos para a Kemuel. */
  function setupBibles() {
    const books = [...document.querySelectorAll('[data-bible]')];
    if (!books.length) return;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const value = name => tokens.getPropertyValue('--bible-' + name).trim();
    const milliseconds = name => parseFloat(value(name + '-duration'));
    const editorialReady = new WeakMap();
    function prepareEditorial(section) {
      if (!section) return Promise.resolve();
      if (!editorialReady.has(section)) {
        const family = tokens.getPropertyValue('--editorial-font').split(',')[0].trim();
        const size = getComputedStyle(section).fontSize;
        const weight = tokens.getPropertyValue('--editorial-weight-body').trim();
        const normal = tokens.getPropertyValue('--editorial-weight-normal').trim();
        const ready = Promise.all([document.fonts.load(`${weight} ${size} ${family}`), document.fonts.load(`italic ${normal} ${size} ${family}`)])
          .then(() => section.classList.add('is-editorial-ready'));
        editorialReady.set(section, ready);
      }
      return editorialReady.get(section);
    }
    if ('IntersectionObserver' in window) {
      const editorial = new IntersectionObserver(entries => entries.forEach(entry => {
        // Encostar na borda da viewport (ratio 0) ainda não é entrar na seção.
        if (entry.isIntersecting && entry.intersectionRatio > 0) { prepareEditorial(entry.target); editorial.unobserve(entry.target); }
      }), { threshold: .001 });
      document.querySelectorAll('.k-editorial').forEach(section => editorial.observe(section));
    } else document.querySelectorAll('.k-editorial').forEach(prepareEditorial);
    books.forEach(book => {
      const scene = book.querySelector('[data-bible-scene]');
      const pages = book.querySelector('[data-bible-pages]');
      const spreads = [...book.querySelectorAll('[data-bible-spread]')];
      const previous = book.querySelector('[data-bible-previous]');
      const next = book.querySelector('[data-bible-next]');
      const status = book.querySelector('[data-bible-status]');
      const animations = new Set();
      let mounted = false, started = false, visible = false, current = 0;
      let turning = false, frame = 0, pointerStart = null;
      const active = () => visible && !document.hidden;
      function motion(target, frames, time) {
        const animation = target.animate(frames, { duration: time, easing });
        animations.add(animation);
        if (!active()) animation.pause();
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
        return animation;
      }
      function resetPointer() {
        cancelAnimationFrame(frame); frame = 0;
        book.classList.remove('is-pointer-active');
        scene.style.removeProperty('--bible-pointer-x');
        scene.style.removeProperty('--bible-pointer-y');
        scene.style.removeProperty('--bible-sheen-shift');
      }
      function syncMotion() {
        for (const animation of animations) {
          if (reduced.matches) animation.finish();
          else if (active()) animation.play();
          else animation.pause();
        }
        if (!active() || reduced.matches) resetPointer();
      }
      async function openOnce() {
        if (!mounted || !visible || started) return;
        started = true;
        if (reduced.matches) { book.dataset.bibleState = 'open'; return; }
        book.dataset.bibleState = 'entering';
        const entrance = motion(scene, [
          { opacity: 0, transform: `translateY(${tokens.getPropertyValue('--enter-offset')}) rotateX(${value('enter-angle')})` },
          { opacity: 1, transform: `rotateX(${value('rest-angle')})` }
        ], milliseconds('enter'));
        await entrance.finished;
        await prepareEditorial(book.closest('.k-editorial'));
        if (reduced.matches) { book.dataset.bibleState = 'open'; return; }
        book.dataset.bibleState = 'opening';
        const cover = scene.querySelector('.k-bible__cover');
        const opening = motion(cover, [
          { transform: `rotateY(${value('rest-angle')}) translateZ(${value('cover-depth')})` },
          { transform: `rotateY(${value('turn-angle')}) translateZ(${value('cover-depth')})` }
        ], milliseconds('open'));
        motion(pages, [{ opacity: 0 }, { opacity: 1 }], milliseconds('open'));
        await opening.finished;
        book.dataset.bibleState = 'open';
      }
      function mount() {
        if (mounted) return;
        mounted = true;
        const template = scene.querySelector('[data-bible-shell]');
        scene.prepend(template.content.cloneNode(true));
        book.dataset.bibleState = reduced.matches ? 'open' : 'closed';
        openOnce();
      }
      function clonePage(page, back) {
        const face = document.createElement('div');
        face.className = 'k-bible-pages__turn-face' + (back ? ' k-bible-pages__turn-face--back' : '');
        const clone = page.cloneNode(true);
        clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        clone.querySelectorAll('a, button, [tabindex]').forEach(node => node.tabIndex = -1);
        face.append(clone); return face;
      }
      async function changePage(index) {
        if (turning || index < 0 || index >= spreads.length || index === current) return;
        if (started && book.dataset.bibleState !== 'open') return;
        const forwards = index > current;
        const old = spreads[current], incoming = spreads[index];
        let sheet;
        if (!reduced.matches && visible) {
          turning = true;
          sheet = document.createElement('div');
          sheet.className = 'k-bible-pages__turn' + (forwards ? '' : ' k-bible-pages__turn--back');
          sheet.setAttribute('aria-hidden', 'true'); sheet.inert = true;
          sheet.append(clonePage(old.children[forwards ? 1 : 0]), clonePage(incoming.children[forwards ? 0 : 1], true));
          pages.append(sheet);
        }
        old.classList.remove('is-current'); old.setAttribute('aria-hidden', 'true'); old.inert = true;
        incoming.classList.add('is-current'); incoming.removeAttribute('aria-hidden'); incoming.inert = false;
        current = index;
        previous.disabled = current === 0; next.disabled = current === spreads.length - 1;
        if (sheet) {
          const angle = forwards ? value('turn-angle') : `calc(${value('turn-angle')} * -1)`;
          await motion(sheet, [{ transform: `rotateY(${value('rest-angle')})` }, { transform: `rotateY(${angle})` }], milliseconds('turn')).finished;
          sheet.remove(); turning = false;
        }
        status.textContent = incoming.getAttribute('aria-label') + '.';
      }
      previous.addEventListener('click', () => changePage(current - 1));
      next.addEventListener('click', () => changePage(current + 1));
      pages.addEventListener('keydown', event => {
        if (event.target.closest('a, button, input, select, textarea')) return;
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault(); changePage(current + (event.key === 'ArrowRight' ? 1 : -1));
      });
      pages.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' || event.target.closest('a, button')) return;
        pointerStart = { x: event.clientX, y: event.clientY };
      }, { passive: true });
      pages.addEventListener('pointerup', event => {
        if (!pointerStart) return;
        const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
        pointerStart = null;
        if (Math.abs(dx) >= Number(value('swipe-distance')) && Math.abs(dx) > Math.abs(dy) * Number(value('swipe-axis-ratio'))) changePage(current + (dx < 0 ? 1 : -1));
      }, { passive: true });
      pages.addEventListener('pointercancel', () => { pointerStart = null; }, { passive: true });
      scene.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || !finePointer.matches || reduced.matches || !active() || book.dataset.bibleState !== 'open' || turning) return;
        cancelAnimationFrame(frame);
        const x = event.clientX, y = event.clientY;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const rect = scene.getBoundingClientRect();
          const px = Math.max(-1, Math.min(1, (x - rect.left) / rect.width * 2 - 1));
          const py = Math.max(-1, Math.min(1, (y - rect.top) / rect.height * 2 - 1));
          const limit = Number(value('tilt-limit'));
          scene.style.setProperty('--bible-pointer-x', `${-py * limit}deg`);
          scene.style.setProperty('--bible-pointer-y', `${px * limit}deg`);
          scene.style.setProperty('--bible-sheen-shift', `${px * Number(value('sheen-travel'))}%`);
          book.classList.add('is-pointer-active');
        });
      }, { passive: true });
      scene.addEventListener('pointerleave', resetPointer);
      finePointer.addEventListener('change', resetPointer);
      reduced.addEventListener('change', () => { syncMotion(); if (reduced.matches && mounted) book.dataset.bibleState = 'open'; });
      document.addEventListener('visibilitychange', syncMotion);
      if ('IntersectionObserver' in window) {
        const nearby = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) { mount(); nearby.disconnect(); }
        }, { rootMargin: value('mount-distance') });
        const onScreen = new IntersectionObserver(entries => {
          visible = entries.at(-1).isIntersecting; book.classList.toggle('is-in-view', visible);
          syncMotion(); if (visible) openOnce();
        });
        nearby.observe(book); onScreen.observe(book);
      } else {
        // Sem observadores: permanece aberta e estática; conteúdo sempre disponível.
        visible = true; started = true; mount(); book.dataset.bibleState = 'open';
      }
    });
  }
  // Fora do caminho crítico da hero: sem montagem de objetos no primeiro paint.
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
    const count = blog.querySelector('[data-blog-count]');
    const status = blog.querySelector('[data-blog-status]');
    chips.forEach(chip => chip.addEventListener('click', () => {
      const value = chip.dataset.blogFilter;
      chips.forEach(item => item.setAttribute('aria-pressed', String(item === chip)));
      let shown = 0;
      cards.forEach(card => {
        const visible = value === 'todos' || card.dataset.blogCategory === value;
        card.hidden = !visible;
        card.classList.remove('is-entering');
        if (visible) { shown++; if (!reduced.matches) { void card.offsetWidth; card.classList.add('is-entering'); } }
      });
      if (count) count.textContent = String(shown).padStart(2, '0');
      if (status) status.textContent = `${shown} ${shown === 1 ? 'reflexão' : 'reflexões'}${value === 'todos' ? '' : ' em ' + chip.querySelector('span').textContent}.`;
    }));
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
