// Gera blog/[slug].html a partir de conteudo/blog/*.md e a lista dados/posts.json.
// Chamado por montar-paginas.mjs. Precisa de "marked" (npm install --prefix scripts).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const esc = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const CSP = "default-src 'self'; style-src 'self'; script-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const WORDS_PER_MINUTE = 200;

function parse(source, file) {
  const m = source.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: front matter ausente`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) continue;
    const raw = kv[2].trim();
    meta[kv[1]] = raw.startsWith('"') ? JSON.parse(raw) : raw === 'true' ? true : raw === 'false' ? false : raw;
  }
  return { meta, body: m[2].trim() };
}

const longDate = iso => new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
const words = text => (text.replace(/[#>*_!\[\]()"|]/g, ' ').match(/\S+/g) || []).length;

export async function loadPosts(root) {
  const dir = join(root, 'conteudo', 'blog');
  if (!existsSync(dir)) return [];
  let marked;
  try { ({ marked } = await import('marked')); } catch {
    throw new Error('Falta a biblioteca marked. Rode: npm install --prefix scripts');
  }
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(file => {
    const slug = file.replace(/\.md$/, '');
    const { meta, body } = parse(readFileSync(join(dir, file), 'utf8'), file);
    const img = `../assets/img/blog/${slug}/`;
    let html = marked.parse(body, { gfm: true, breaks: false });
    // Citação em destaque e imagem sozinha num parágrafo viram figuras do k-article.
    html = html.replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/g, '<figure class="k-article__quote"><blockquote><p>$1</p></blockquote></figure>');
    html = html.replace(/<p><img src="([^"]+)" alt="([^"]*)"(?: title="([^"]*)")?\s*\/?><\/p>/g, (_, src, alt, credit = '') =>
      `<figure class="k-article__figure"><img src="${img}${src}" alt="${alt}" width="960" loading="lazy" decoding="async"><figcaption>${alt}${credit ? ` <span class="k-article__credit">${credit}</span>` : ''}</figcaption></figure>`);
    const minutes = Math.max(1, Math.ceil((words(body) + words(meta.subtitulo || '') + words(meta.titulo)) / WORDS_PER_MINUTE));
    return { slug, ...meta, leitura: minutes, html, url: `/blog/${slug}` };
  }).sort((a, b) => b.data.localeCompare(a.data) || a.slug.localeCompare(b.slug));
}

// Lista gerada para dados/posts.json (nunca editada à mão).
export function postsIndex(posts) {
  return JSON.stringify(posts.map(p => ({
    slug: p.slug, url: p.url, titulo: p.titulo, subtitulo: p.subtitulo, categoria: p.categoria, autor: p.autor, data: p.data,
    referencia: p.referencia, leitura: p.leitura, exemplo: p.exemplo === true,
    capa: p.capa ? { 480: `/assets/img/blog/${p.slug}/capa-480.webp`, 960: `/assets/img/blog/${p.slug}/capa-960.webp`, 1600: `/assets/img/blog/${p.slug}/capa-1600.webp`, legenda: p.capa_legenda, credito: p.capa_credito } : null
  })), null, 2) + '\n';
}

function related(post, posts) {
  const others = posts.filter(p => p.slug !== post.slug);
  const same = others.filter(p => p.categoria === post.categoria);
  return [...same, ...others.filter(p => !same.includes(p))].slice(0, 3);
}

export function postPage(post, posts, church) {
  const site = church.site;
  const url = `${site}${post.url}`;
  const title = `${post.titulo} · ${church.nome} · ${church.cidade}, ${church.uf}`;
  const cover = post.capa ? `${site}/assets/img/blog/${post.slug}/capa-1600.webp` : `${site}/assets/brand/og-igreja-kemuel.png`;
  const author = post.autor === church.nome
    ? { '@type': 'Organization', name: church.nome, url: `${site}/` }
    : { '@type': 'Person', name: post.autor };
  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.titulo, description: post.subtitulo,
    datePublished: post.data, author, publisher: { '@type': 'Organization', name: church.nome, url: `${site}/` },
    image: cover, mainEntityOfPage: url, inLanguage: 'pt-BR'
  }, null, 2).replaceAll('<', '\\u003c').split('\n').map(l => `  ${l}`).join('\n');
  const share = encodeURIComponent(`${post.titulo} ${url}`);
  const coverHtml = post.capa ? `
      <figure class="k-article__cover"><img src="../assets/img/blog/${post.slug}/capa-960.webp" srcset="../assets/img/blog/${post.slug}/capa-960.webp 960w, ../assets/img/blog/${post.slug}/capa-1600.webp 1600w" sizes="(min-width: 60rem) 52rem, 100vw" width="1600" height="1067" alt="${esc(post.capa_legenda || post.titulo)}" fetchpriority="high" decoding="async"><figcaption>${esc(post.capa_legenda)} <span class="k-article__credit">${esc(post.capa_credito)}</span></figcaption></figure>` : '';
  const reading = related(post, posts).map(p => `<li><a href="${p.url}"><span class="k-article__category">${esc(p.categoria)}</span><span class="k-article__related-title">${esc(p.titulo)}</span></a></li>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(post.subtitulo)}">
  <meta name="robots" content="noindex">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <title>${esc(title)}</title>
  <meta property="og:type" content="article">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${esc(church.nome)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(post.subtitulo)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${cover}">
  <!-- icons:start -->
x
  <!-- icons:end -->
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <script src="../assets/js/ui.js" defer></script>
  <script type="application/ld+json">
${ld}
  </script>
</head>
<body>
  <!-- symbols:start -->
x
  <!-- symbols:end -->
  <div class="k-reading-progress" data-reading-progress aria-hidden="true"><span></span></div>
  <!-- header:start -->
x
  <!-- header:end -->
  <main id="conteudo" class="k-article-main">
    <article class="k-article" aria-labelledby="post-titulo">
${post.exemplo === true ? '      <p class="k-article__notice">Este é um texto de exemplo para mostrar como o blog vai funcionar.</p>\n' : ''}      <header class="k-article__header">
        <p class="k-article__category">${esc(post.categoria)}</p>
        <h1 class="k-article__title" id="post-titulo">${esc(post.titulo)}</h1>
        ${post.subtitulo ? `<p class="k-article__dek">${esc(post.subtitulo)}</p>` : ''}
        <p class="k-article__byline">Por ${esc(post.autor)} · <time datetime="${post.data}">${longDate(post.data)}</time> · ${post.leitura} min de leitura</p>
      </header>${coverHtml}
      <div class="k-article__body">
${post.html.trim()}
      </div>
${post.referencia ? `      <p class="k-article__reference">Texto base: ${esc(post.referencia)}</p>\n` : ''}      <footer class="k-article__footer">
        <div class="k-article__share"><p class="k-article__label">Compartilhar</p><button class="k-article__link" type="button" data-share-copy data-url="${url}">Copiar link</button><a class="k-article__link" href="https://wa.me/?text=${share}" target="_blank" rel="noopener noreferrer">WhatsApp<span class="k-sr-only"> (abre em nova aba)</span></a></div>
        <nav class="k-article__related" aria-labelledby="leia-tambem"><h2 class="k-article__label" id="leia-tambem">Leia também</h2><ul>${reading}</ul></nav>
      </footer>
    </article>
  </main>
  <!-- footer:start -->
x
  <!-- footer:end -->
  <!-- toast:start -->
x
  <!-- toast:end -->
</body>
</html>
`;
}

const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pad = n => String(n).padStart(2, '0');

// Dobra "Para sua caminhada": cabeçalho, filtros, nota e cards. Contagens ignoram posts em_breve.
// prefixo: caminho até assets/ ("assets/" na raiz, "" dentro de assets/); id: prefixo único de ids.
export function blogFeature(posts, prefixo = 'assets/', id = 'caminhada') {
  const live = posts.filter(p => p.em_breve !== true);
  const ordered = [...live].sort((a, b) => a.data.localeCompare(b.data) || a.slug.localeCompare(b.slug));
  const categories = [...new Map(ordered.map(p => [slug(p.categoria), p.categoria])).entries()];
  const chip = (key, label, count, active) => `<button class="k-blog-filter__chip" type="button" data-blog-filter="${key}" aria-pressed="${active}"><span>${esc(label)}</span><span class="k-blog-filter__count">${count}</span></button>`;
  const filters = chip('todos', 'Todos', live.length, true) + categories.map(([key, label]) => chip(key, label, live.filter(p => slug(p.categoria) === key).length, false)).join('');
  const variants = ['arch', 'torn', 'arch k-collage-cover--dark', 'torn k-collage-cover--dark', 'arch'];
  const cards = ordered.map((p, i) => {
    const img = `${prefixo}img/blog/${p.slug}/capa`;
    const cover = p.capa ? `<img class="k-collage-cover__image" src="${img}-480.webp" srcset="${img}-480.webp 480w, ${img}-960.webp 960w" sizes="(min-width: 56.25rem) 18vw, 66vw" width="480" height="320" alt="" loading="lazy" decoding="async">` : '';
    return `<li class="k-blog-card" data-blog-category="${slug(p.categoria)}"><a class="k-blog-card__link" href="${p.url}">`
      + `<span class="k-collage-cover k-collage-cover--${variants[i % variants.length]}"><span class="k-collage-cover__tag">${esc(p.categoria)}</span>${p.exemplo === true ? '<span class="k-collage-cover__badge">Exemplo</span>' : ''}<span class="k-collage-cover__circle" aria-hidden="true"></span>${cover}<span class="k-collage-cover__block" aria-hidden="true"></span></span>`
      + `<span class="k-blog-card__meta"><span>Nº ${pad(i + 1)}</span><span>${p.data.slice(0, 4)}</span></span>`
      + `<h3 class="k-blog-card__title">${esc(p.titulo)}</h3>`
      + `<p class="k-blog-card__summary">${esc(p.subtitulo)} <span class="k-blog-card__time">${p.leitura} min de leitura</span></p>`
      + `<span class="k-blog-card__arrow" aria-hidden="true"><svg class="k-icon"><use href="#k-arrow"/></svg></span></a></li>`;
  }).join('');
  return `        <div class="k-blog" data-blog>
          <header class="k-blog-header">
            <h2 class="k-blog-header__title" id="${id}-titulo">Reflexões para levar a fé aos <em>outros dias</em> da <em>semana</em><span class="k-blog-header__dot">.</span></h2>
            <div class="k-blog-header__aside">
              <div class="k-blog-filter" role="group" aria-label="Filtrar reflexões por tema">${filters}</div>
              <p class="k-blog-note"><span class="k-blog-note__count" data-blog-count>${pad(live.length)}</span><span class="k-blog-note__text"><strong>Reflexões para começar</strong><span>Escolha um tema e leia em poucos minutos</span></span></p>
            </div>
          </header>
          <ol class="k-blog-grid" aria-label="Reflexões do blog">${cards}</ol>
          <p class="k-sr-only" data-blog-status role="status" aria-live="polite"></p>
          <a class="k-link" href="/blog">Ver todos os posts<svg class="k-icon k-icon--small" aria-hidden="true"><use href="#k-arrow"/></svg></a>
        </div>`;
}
