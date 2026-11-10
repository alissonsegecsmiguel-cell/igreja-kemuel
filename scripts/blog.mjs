// Gera blog/[slug].html a partir de conteudo/blog/*.md e a lista dados/posts.json.
// Chamado por montar-paginas.mjs. Precisa de "marked" (npm install --prefix scripts).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { robots, twitterTags } from './dados-igreja.mjs';

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
    meta[kv[1]] = raw.startsWith('"') || raw.startsWith('[') ? JSON.parse(raw) : raw === 'true' ? true : raw === 'false' ? false : raw;
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
  const files = readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const upcoming = join(dir, 'em-breve');
  if (existsSync(upcoming)) files.push(...readdirSync(upcoming).filter(f => f.endsWith('.md')).sort().map(f => `em-breve/${f}`));
  const entries = await Promise.all(files.map(async file => {
    const slug = file.split('/').at(-1).replace(/\.md$/, '');
    const { meta, body } = parse(readFileSync(join(dir, file), 'utf8'), file);
    if (!Array.isArray(meta.temas) || meta.temas.length < 2 || meta.temas.length > 4 || meta.temas.some(t => typeof t !== 'string' || !t.trim()) || new Set(meta.temas).size !== meta.temas.length) throw new Error(`${file}: informe de 2 a 4 temas distintos no front matter`);
    const img = `../assets/img/blog/${slug}/`;
    let html = marked.parse(body, { gfm: true, breaks: false });
    // Citação em destaque e imagem sozinha num parágrafo viram figuras do k-article.
    html = html.replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/g, '<figure class="k-article__quote"><blockquote><p>$1</p></blockquote></figure>');
    html = html.replace(/<p><img src="([^"]+)" alt="([^"]*)"(?: title="([^"]*)")?\s*\/?><\/p>/g, (_, src, alt, credit = '') =>
      `<figure class="k-article__figure"><img src="${img}${src}" alt="${alt}" width="960" loading="lazy" decoding="async"><figcaption>${alt}${credit ? ` <span class="k-article__credit">${credit}</span>` : ''}</figcaption></figure>`);
    const minutes = Math.max(1, Math.ceil((words(body) + words(meta.subtitulo || '') + words(meta.titulo)) / WORDS_PER_MINUTE));
    if (file.startsWith('em-breve/') && meta.em_breve !== true) throw new Error(`${file}: mova o texto completo para conteudo/blog/ antes de publicar`);
    if (meta.slug && meta.slug !== slug) throw new Error(`${file}: slug diferente do nome do arquivo`);
    let cardCover = null;
    const cardFile = join(root, 'assets', 'img', 'blog', slug, 'capa-card-600.webp');
    if (meta.capa && existsSync(cardFile)) {
      const { default: sharp } = await import('sharp');
      cardCover = await Promise.all([600, 900, 1400].map(async size => {
        const file = `capa-card-${size}.webp`;
        const info = await sharp(join(root, 'assets', 'img', 'blog', slug, file)).metadata();
        return { size, file, width: info.width, height: info.height };
      }));
    }
    const og = existsSync(join(root, 'assets', 'img', 'blog', slug, 'og-1200x630.jpg'));
    return { slug, ...meta, cardCover, og, leitura: meta.em_breve ? null : minutes, html, url: meta.em_breve ? null : `/blog/${slug}` };
  }));
  return entries.sort((a, b) => Number(a.em_breve === true) - Number(b.em_breve === true) || (a.em_breve ? String(a.numero).localeCompare(String(b.numero)) : (b.data || '').localeCompare(a.data || '')) || a.slug.localeCompare(b.slug));
}

// Lista gerada para dados/posts.json (nunca editada à mão).
export function postsIndex(posts) {
  return JSON.stringify(posts.map(p => ({
    slug: p.slug, url: p.url, numero: p.numero, titulo: p.titulo, subtitulo: p.subtitulo || p.resumo, categoria: p.categoria, autor: p.autor, data: p.data,
    referencia: p.referencia, temas: p.temas, leitura: p.leitura, exemplo: p.exemplo === true, em_breve: p.em_breve === true, recomendado: p.recomendado === true,
    capa: p.capa ? { 480: `/assets/img/blog/${p.slug}/capa-480.webp`, 960: `/assets/img/blog/${p.slug}/capa-960.webp`, ...(p.cardCover ? Object.fromEntries(p.cardCover.map(v => [v.size, `/assets/img/blog/${p.slug}/${v.file}`])) : {}), ...(!p.em_breve ? { 1600: `/assets/img/blog/${p.slug}/capa-1600.webp` } : {}), legenda: p.capa_legenda, credito: p.capa_credito } : null
  })), null, 2) + '\n';
}

function related(post, posts) {
  const others = posts.filter(p => p.slug !== post.slug && p.em_breve !== true);
  const same = others.filter(p => p.categoria === post.categoria);
  return [...same, ...others.filter(p => !same.includes(p))].slice(0, 3);
}

export function postPage(post, posts, church) {
  const site = church.site.url;
  const url = `${site}${post.url}`;
  const title = `${post.titulo} · ${church.nome} · ${church.cidade}, ${church.uf}`;
  const cover = post.capa ? `${site}/assets/img/blog/${post.slug}/capa-1600.webp` : `${site}/assets/brand/og-igreja-kemuel.png`;
  // Prévia 1200×630 em JPEG gerada pelo converter-post; sem ela, a imagem da marca.
  const og = post.og ? { image: `${site}/assets/img/blog/${post.slug}/og-1200x630.jpg`, alt: post.capa_legenda || post.titulo } : { image: `${site}/assets/brand/og-igreja-kemuel.png`, alt: 'Logo da Igreja Kemuel' };
  const publisher = { '@type': 'Organization', name: church.nome, url: `${site}/`, logo: { '@type': 'ImageObject', url: `${site}/assets/brand/logo-empilhado-escuro.svg` } };
  const author = post.autor === church.nome
    ? { '@type': 'Organization', name: church.nome, url: `${site}/` }
    : { '@type': 'Person', name: post.autor };
  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.titulo, description: post.subtitulo,
    datePublished: post.data, dateModified: post.atualizado || post.data, author, publisher,
    image: [cover, ...(post.og ? [og.image] : [])], mainEntityOfPage: { '@type': 'WebPage', '@id': url }, inLanguage: 'pt-BR'
  }, null, 2).replaceAll('<', '\\u003c').split('\n').map(l => `  ${l}`).join('\n');
  const crumbs = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [['Início', `${site}/`], ['Blog', `${site}/blog`], [post.titulo, url]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item }))
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
  <meta name="robots" content="${robots(church, post.exemplo === true)}">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <title>${esc(title)}</title>
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${esc(church.nome)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(post.subtitulo)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${og.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(og.alt)}">
${twitterTags('  ', { title, description: post.subtitulo, image: og.image, alt: og.alt })}
  <!-- icons:start -->
x
  <!-- icons:end -->
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <script src="../assets/js/ui.js" defer></script>
  <script type="application/ld+json">
${ld}
  </script>
  <script type="application/ld+json">
${crumbs}
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
  const ordered = [...live].sort((a, b) => b.data.localeCompare(a.data) || a.slug.localeCompare(b.slug));
  // A ordem dos filtros é preservada; a dos cards passa a ser cronológica inversa.
  const categoryOrder = [...live].sort((a, b) => a.data.localeCompare(b.data) || a.slug.localeCompare(b.slug));
  const categories = [...new Map(categoryOrder.map(p => [slug(p.categoria), p.categoria])).entries()];
  const chip = (key, label, count, active) => `<button class="k-blog-filter__chip" type="button" data-blog-filter="${key}" aria-pressed="${active}"><span>${esc(label)}</span><span class="k-blog-filter__count">${count}</span></button>`;
  const filters = chip('todos', 'Todos', live.length, true) + categories.map(([key, label]) => chip(key, label, live.filter(p => slug(p.categoria) === key).length, false)).join('');
  const cards = ordered.map((p, i) => {
    const img = `${prefixo}img/blog/${p.slug}/`;
    const large = i === 0;
    // min()/clamp() espelham container/gutter/gap; auto usa a largura real em lazy loading.
    const frame = 'min(80rem, 100vw - clamp(2.5rem, 8.4vw, 8rem))';
    const gap = 'clamp(1rem, 1.5vw, 1.5rem)';
    const sizes = `auto, (max-width: 760px) calc(100vw - clamp(2.5rem, 8.4vw, 8rem)), calc((${frame} - ${large ? gap : `3 * ${gap}`}) / ${large ? 2 : 4})`;
    const source = p.cardCover?.[0];
    const srcset = p.cardCover
      ? [...new Map(p.cardCover.map(v => [v.width, `${img}${v.file} ${v.width}w`])).values()].join(', ')
      : `${img}capa-480.webp 480w, ${img}capa-960.webp 960w`;
    const cover = p.capa ? `<img class="k-blog-cover__image" src="${img}${source?.file || 'capa-960.webp'}" srcset="${srcset}" sizes="${sizes}" width="${source?.width || 960}" height="${source?.height || 640}" alt="${esc(p.capa_legenda || '')}" loading="lazy" decoding="async">` : '';
    return `<li class="k-blog-card${large ? ' k-blog-card--featured' : ''}" data-blog-category="${slug(p.categoria)}"><a class="k-blog-card__link" href="${p.url}">`
      + `<span class="k-blog-cover">${cover}<span class="k-label k-blog-cover__tag">${esc(p.categoria)}</span></span>`
      + `<span class="k-blog-card__meta">Nº ${pad(i + 1)} · ${p.data.slice(0, 4)}${p.exemplo === true ? ' · Exemplo' : ''}</span>`
      + `<h3 class="k-blog-card__title">${esc(p.titulo)}</h3>`
      + `<p class="k-blog-card__summary">${esc(p.subtitulo)}</p>`
      + `<span class="k-blog-card__time">${p.leitura} min de leitura</span></a></li>`;
  }).join('');
  return `        <div class="k-blog" data-blog>
          <header class="k-blog-header">
            <h2 class="k-blog-header__title" id="${id}-titulo">Reflexões para levar a fé aos <em>outros dias da semana</em><span class="k-blog-header__dot">.</span></h2>
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
