import { createSearch, normalize, moods } from './search.mjs';

// Exclusivo do portal; o manual usa a mesma demonstração, sem duplicar lógica.
document.querySelectorAll('[data-blog-portal]').forEach(portal => {
  const $ = selector => portal.querySelector(selector);
  const input = $('[data-portal-input]'), list = $('.k-search-suggest__list');
  const rows = [...portal.querySelectorAll('[data-portal-slug]')];
  const bySlug = new Map(rows.map(row => [row.dataset.portalSlug, row]));
  const tabs = [...portal.querySelectorAll('[data-portal-category]')];
  const picks = [...portal.querySelectorAll('[data-portal-mood]')];
  const tokens = getComputedStyle(document.documentElement);
  const pageSize = parseInt(tokens.getPropertyValue('--blog-page-size'), 10);
  const delay = parseFloat(tokens.getPropertyValue('--search-debounce'));
  const maxSuggestions = parseInt(tokens.getPropertyValue('--search-suggestions'), 10);
  const snippetLength = parseInt(tokens.getPropertyValue('--search-snippet-length'), 10);
  let engine, pending, timer, category = 'todos', mood = '', limit = pageSize, selected = -1, suggestions = [], dismissed = false;
  const metadata = row => ({ slug: row.dataset.portalSlug, categoria: row.dataset.portalCategoryKey });
  const title = row => row.querySelector('h3').textContent;
  function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); selected = -1; }
  function highlighted(text, terms) {
    const fragment = document.createDocumentFragment();
    for (const part of text.split(/([\p{L}\p{N}]+)/u)) {
      const match = terms.some(term => term.length >= 2 && normalize(part).startsWith(term));
      const node = match ? document.createElement('mark') : document.createTextNode(part);
      if (match) node.textContent = part;
      fragment.append(node);
    }
    return fragment;
  }
  function snippet(hit, row) {
    const node = row.querySelector('[data-search-snippet]');
    node.replaceChildren(); node.hidden = !hit.bodyMatch;
    if (!hit.bodyMatch) return;
    const text = hit.post.texto_original;
    const match = [...text.matchAll(/[\p{L}\p{N}]+/gu)].find(m => normalize(m[0]) === hit.bodyMatch);
    if (!match) { node.hidden = true; return; }
    const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, match.index - snippetLength / 3)) + 1);
    const end = Math.min(text.length, start + snippetLength);
    node.append(highlighted(`${start ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`, hit.words));
  }
  function showSuggestions(hits, terms) {
    close(); list.replaceChildren(); suggestions = hits.slice(0, maxSuggestions);
    if (dismissed || normalize(input.value).length < 2 || document.activeElement !== input || !suggestions.length) return;
    suggestions.forEach((hit, i) => {
      const row = bySlug.get(hit.post.slug), option = document.createElement('li');
      option.id = `blog-opcao-${i}`; option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false'); option.dataset.searchOption = String(i);
      const heading = document.createElement('span'); heading.append(highlighted(title(row), [...terms, ...hit.words])); option.append(heading);
      const meta = document.createElement('span'); meta.className = 'k-caption k-muted'; meta.textContent = row.querySelector('.k-label').childNodes[0].textContent.trim(); option.append(meta);
      if (!row.querySelector('a')) { const badge = document.createElement('span'); badge.className = 'k-badge k-badge--neutral'; badge.textContent = 'Em breve'; option.append(badge); option.setAttribute('aria-disabled', 'true'); }
      list.append(option);
    });
    list.hidden = false; input.setAttribute('aria-expanded', 'true');
  }
  function saveHash() {
    const term = input.value.trim();
    const hash = mood ? `momento=${mood}` : term && category !== 'todos' ? new URLSearchParams({ busca: term, categoria: category }).toString() : term ? encodeURIComponent(term) : category !== 'todos' ? `categoria=${category}` : '';
    history.replaceState(null, '', location.pathname + location.search + (hash ? '#' + hash : ''));
  }
  function render(save = false, suggest = false) {
    const result = engine ? engine.search(input.value.trim(), { category, mood }) : { hits: rows.map(row => ({ post: metadata(row) })).filter(h => category === 'todos' || h.post.categoria === category), terms: [] };
    const shown = new Set(result.hits.slice(0, limit).map(h => h.post.slug));
    rows.forEach(row => { row.hidden = !shown.has(row.dataset.portalSlug); row.querySelector('[data-search-snippet]').hidden = true; });
    result.hits.forEach(hit => { const row = bySlug.get(hit.post.slug); row.parentElement.append(row); if (engine) snippet(hit, row); });
    $('[data-portal-highlights]').hidden = Boolean(input.value.trim() || mood || category !== 'todos');
    $('[data-portal-clear]').hidden = !input.value && !mood;
    tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.portalCategory === category)));
    picks.forEach(pick => pick.setAttribute('aria-pressed', String(pick.dataset.portalMood === mood)));
    $('[data-portal-title]').textContent = moods.find(m => m.id === mood)?.title || 'Artigos';
    $('[data-portal-count]').textContent = `${result.hits.length} ${result.hits.length === 1 ? 'resultado' : 'resultados'}${input.value.trim() ? ` para “${input.value.trim()}”` : ''}`;
    $('[data-portal-more]').hidden = result.hits.length <= limit;
    $('[data-portal-empty]').hidden = result.hits.length !== 0;
    $('[data-portal-empty-text]').textContent = `Nada encontrado para “${input.value.trim() || mood || category}”. Tente outra palavra ou escolha um caminho abaixo.`;
    $('[data-portal-correction]').hidden = !result.correction;
    const correction = $('[data-portal-correction-link]'); correction.textContent = result.correction || ''; correction.href = '#' + encodeURIComponent(result.correction || '');
    $('[data-portal-ambiguity]').hidden = !result.ambiguous;
    if (suggest) showSuggestions(result.hits, result.terms); else close();
    if (save) saveHash();
    return result;
  }
  function load() {
    if (pending) return pending;
    input.setAttribute('aria-busy', 'true');
    pending = Promise.all(['busca', 'sinonimos', 'livros-biblia'].map(async name => {
      const response = await fetch(`/dados/${name}.json`, { credentials: 'omit' });
      if (!response.ok) throw new Error('Dados de busca indisponíveis');
      return response.json();
    })).then(([index, synonyms, books]) => {
      if (!Array.isArray(index) || index.length !== rows.length || index.some(p => !bySlug.has(p.slug))) throw new Error('Índice incompatível');
      engine = createSearch(index, synonyms, books);
      return true;
    }).catch(() => {
      const message = $('[data-portal-failure]'); message.hidden = false;
      message.textContent = 'A busca está indisponível no momento. Todos os artigos continuam listados abaixo.';
      rows.forEach(row => { row.hidden = false; }); $('[data-portal-more]').hidden = true; close();
      return false;
    }).finally(() => input.removeAttribute('aria-busy'));
    return pending;
  }
  async function update(save = true, suggest = false) { if (await load()) render(save, suggest); }
  function activate(i) {
    const hit = suggestions[i]; if (!hit) return;
    const row = bySlug.get(hit.post.slug), link = row.querySelector('a');
    if (link) location.assign(link.href);
    else $('[data-portal-count]').textContent = `${title(row)}. Artigo em breve, ainda sem leitura disponível.`;
  }
  $('[data-portal-search]').addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); if (selected >= 0) activate(selected); else { update(); close(); } });
  input.addEventListener('focus', () => { dismissed = false; load().then(ok => { if (ok && input.value) render(false, true); }); });
  input.addEventListener('input', () => { dismissed = false; mood = ''; limit = pageSize; clearTimeout(timer); close(); timer = setTimeout(() => update(true, true), delay); });
  input.addEventListener('blur', () => { dismissed = true; close(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dismissed = true; close(); return; }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    dismissed = false;
    if (list.hidden && engine) showSuggestions(render().hits, normalize(input.value).split(' '));
    if (list.hidden) return;
    selected = (selected + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length;
    [...list.children].forEach((option, i) => option.setAttribute('aria-selected', String(i === selected)));
    input.setAttribute('aria-activedescendant', list.children[selected].id); list.children[selected].scrollIntoView({ block: 'nearest' });
  });
  list.addEventListener('pointerdown', event => event.preventDefault());
  list.addEventListener('click', event => { const option = event.target.closest('[data-search-option]'); if (option) activate(Number(option.dataset.searchOption)); });
  tabs.forEach(tab => tab.addEventListener('click', () => { clearTimeout(timer); category = tab.dataset.portalCategory; mood = ''; limit = pageSize; update(); }));
  picks.forEach(pick => pick.addEventListener('click', () => { clearTimeout(timer); mood = pick.dataset.portalMood; input.value = ''; category = 'todos'; limit = pageSize; update(); }));
  function reset(all) { clearTimeout(timer); input.value = ''; mood = ''; if (all) category = 'todos'; limit = pageSize; render(true); input.focus(); }
  $('[data-portal-clear]').addEventListener('click', () => reset(false));
  $('[data-portal-reset]').addEventListener('click', () => reset(true));
  $('[data-portal-correction-link]').addEventListener('click', event => { event.preventDefault(); input.value = event.currentTarget.textContent; mood = ''; category = 'todos'; limit = pageSize; update(); input.focus(); });
  $('[data-portal-more]').addEventListener('click', () => { limit += pageSize; render(); });
  function fromHash() {
    const raw = location.hash.slice(1), params = new URLSearchParams(raw);
    const known = tabs.some(tab => tab.dataset.portalCategory === raw);
    category = params.get('categoria') || (known ? raw : 'todos');
    if (!tabs.some(tab => tab.dataset.portalCategory === category)) category = 'todos';
    mood = moods.some(m => m.id === params.get('momento')) ? params.get('momento') : '';
    try { input.value = params.get('busca') || (params.has('categoria') || params.has('momento') || known ? '' : decodeURIComponent(raw)); } catch { input.value = ''; }
    limit = pageSize;
    if (raw) update(false); else render();
  }
  addEventListener('hashchange', fromHash); fromHash();
});
