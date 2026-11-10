// HTML estático e índice JSON compartilham os front matters; sem código da referência.
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const key = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const date = value => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)) : '';
const categories = ['Fé', 'Palavra', 'Escrituras', 'Chamado', 'Amor ao próximo', 'Antigo Testamento'];
export function blogPortal(posts, verse, prefix = 'assets/') {
  const live = posts.filter(p => !p.em_breve);
  const image = (p, cls, sizes, priority = false) => `<img class="${cls}" src="${prefix}img/blog/${p.slug}/capa-${priority ? 960 : 480}.webp" srcset="${prefix}img/blog/${p.slug}/capa-480.webp 480w, ${prefix}img/blog/${p.slug}/capa-960.webp 960w" sizes="${sizes}" width="960" height="640" alt="${esc(p.capa_legenda || p.titulo)}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  const tab = (name, value, count) => `<button class="k-blog-tab" type="button" data-portal-category="${value}" aria-pressed="${value === 'todos'}">${esc(name)}${count === undefined ? '' : ` <span class="k-caption">${count}</span>`}</button>`;
  const feature = live[0];
  return `<div class="k-blog-portal" data-blog-portal data-posts-url="/dados/posts.json">
      <header class="k-blog-portal__top" data-reveal>
        <p class="k-eyebrow">Blog da Igreja Kemuel</p><h1 class="k-sr-only">Blog da Igreja Kemuel</h1>
        <figure class="k-verse"><blockquote><p>${esc(verse.texto)}</p></blockquote><figcaption>${esc(verse.referencia)} · ${esc(verse.traducao)}</figcaption></figure>
        <form class="k-blog-search" role="search" data-portal-search><label class="k-sr-only" for="blog-busca">Buscar artigos por tema, personagem ou passagem</label><svg class="k-icon" aria-hidden="true"><use href="#k-search"/></svg><input id="blog-busca" name="busca" type="search" autocomplete="off" placeholder="Busque por tema, personagem ou passagem" aria-describedby="blog-busca-ajuda" aria-controls="portal-artigos" data-portal-input><button class="k-blog-search__clear" type="button" data-portal-clear hidden>Limpar</button></form>
        <p id="blog-busca-ajuda" class="k-caption k-muted">Busque por tema, personagem ou passagem.</p>
        <div class="k-blog-tabs" role="group" aria-label="Temas do blog">${tab('Todos', 'todos')}${categories.map(c => tab(c, key(c))).join('')}</div>
        <div class="k-blog-suggestions" role="group" aria-label="Sugestões de busca">${['perdão','coragem','oração','família','recomeço','fé'].map(s => `<button class="k-chip" type="button" data-portal-suggestion="${s}">${s}</button>`).join('')}</div>
      </header>
      <div class="k-blog-portal__highlights" data-portal-highlights>
        <article class="k-blog-feature"><a href="${feature.url}">${image(feature, 'k-blog-feature__image', '(min-width: 56.25rem) 60vw, 90vw', true)}<div class="k-blog-feature__copy"><span class="k-label">${esc(feature.categoria)}</span><h2>${esc(feature.titulo)}</h2><p class="k-body-sm">${esc(feature.subtitulo)}</p><p class="k-caption">${date(feature.data)} · ${feature.leitura} min de leitura</p><span class="k-link">Ler artigo<svg class="k-icon" aria-hidden="true"><use href="#k-arrow"/></svg></span></div></a></article>
        <section class="k-blog-recommended" aria-labelledby="portal-recomendados"><h2 class="k-h6" id="portal-recomendados">Recomendados</h2><ul>${live.filter(p => p.recomendado).slice(0,3).map(p => `<li><a href="${p.url}">${image(p, '', '(min-width: 56.25rem) 25vw, 66vw')}<span class="k-label">${esc(p.categoria)}</span><h3 class="k-h5">${esc(p.titulo)}</h3></a></li>`).join('')}</ul></section>
      </div>
      <div class="k-blog-portal__body">
        <section class="k-stack" aria-labelledby="portal-artigos-titulo"><div class="k-spread"><h2 class="k-h3" id="portal-artigos-titulo">Artigos</h2><p class="k-caption k-muted" data-portal-count role="status" aria-live="polite">${posts.length} artigos</p></div><p class="k-body-sm k-muted" data-portal-failure hidden></p><div class="k-stack" data-portal-empty hidden><p data-portal-empty-text></p><button class="k-button k-button--secondary" type="button" data-portal-reset>Ver todos os artigos</button></div>
        <ol class="k-blog-list" id="portal-artigos">${posts.map(p => `<li class="k-blog-list-item" data-portal-slug="${p.slug}">${p.em_breve ? `<article aria-label="Artigo em breve: ${esc(p.titulo)}">` : `<a href="${p.url}">`}${image(p, '', '(min-width: 56.25rem) 12rem, 25vw')}<div class="k-stack"><p class="k-label">${esc(p.categoria)}${p.em_breve ? ' <span class="k-badge k-badge--neutral">Em breve</span>' : ''}</p><h3 class="k-h5">${esc(p.titulo)}</h3><p class="k-blog-list-item__summary">${esc(p.subtitulo || p.resumo)}</p><p class="k-caption k-muted">${p.em_breve ? esc(p.referencia) : date(p.data) + ' · ' + p.leitura + ' min de leitura'}</p></div>${p.em_breve ? '</article>' : '</a>'}</li>`).join('')}</ol>
        <button class="k-button k-button--secondary" type="button" data-portal-more>Carregar mais artigos</button></section>
        <aside class="k-blog-sidebar" aria-labelledby="portal-categorias-titulo"><h2 class="k-h6" id="portal-categorias-titulo">Categorias</h2><div class="k-blog-sidebar__tags" role="group" aria-label="Categorias com contagem">${tab('Todos','todos',posts.length)}${categories.map(c => tab(c,key(c),posts.filter(p=>p.categoria===c).length)).join('')}</div><p class="k-caption k-muted">Os textos disponíveis são exemplos. Os artigos marcados “Em breve” ainda serão escritos.</p><details class="k-blog-credits"><summary class="k-caption">Créditos das imagens</summary><ul>${posts.map(p=>`<li><strong>${esc(p.titulo)}</strong> — ${esc(p.capa_credito || '')}</li>`).join('')}</ul></details></aside>
      </div>
    </div>`;
}
