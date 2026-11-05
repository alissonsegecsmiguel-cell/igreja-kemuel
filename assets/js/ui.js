/* Interações próprias, sem bibliotecas, rastreamento ou pedidos de rede. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(root);
  const duration = name => parseFloat(tokens.getPropertyValue('--duration-' + name));
  const easing = tokens.getPropertyValue('--ease').trim();
  const faqAnimations = new Map();
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
        document.querySelectorAll('main, .k-whatsapp, .k-endnote').forEach(el => { el.inert = open; });
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
    summary.addEventListener('click', event => {
      event.preventDefault();
      faqAnimations.get(details)?.cancel();
      const opening = !details.open || details.dataset.closing === 'true';
      delete details.dataset.closing;
      if (reduced.matches) { details.open = opening; return; }
      if (opening) details.open = true;
      else details.dataset.closing = 'true';
      const frames = opening
        ? [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-4px)' }];
      const animation = body.animate(frames, { duration: duration('medium'), easing });
      faqAnimations.set(details, animation);
      animation.onfinish = () => {
        if (!opening) details.open = false;
        delete details.dataset.closing;
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
