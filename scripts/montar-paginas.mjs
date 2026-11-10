// Aplica partials/ nas páginas .html da raiz e os blocos comuns no manual.
// Rodar antes do commit: node scripts/montar-paginas.mjs
// O resultado é HTML estático; a Vercel não executa este script.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData, fillData, fillHead, jsonLd } from './dados-igreja.mjs';
import { loadPosts, postPage, postsIndex, blogFeature } from './blog.mjs';
import { loadMaterials, materialCards } from './materiais.mjs';
import { blogPortal } from './blog-portal.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const partial = name => read(join(root, 'partials', name)).trimEnd();
// Endereço, horários e dados da igreja vêm só de dados/igreja.json.
const church = loadData(root);

function header(page) {
  let html = partial('header.html');
  // Item ativo: o endereço limpo do menu é o nome do arquivo.
  html = html.replaceAll(`<a href="/${page}">`, `<a href="/${page}" aria-current="page">`);
  // Variante transparente e âncora local só na página principal.
  if (page === 'index') html = html.replace('<header class="k-header">', '<header class="k-header k-header--over">').replaceAll('href="/#visite"', 'href="#visite"');
  return html;
}

// A 404 é servida em qualquer profundidade; as demais ficam na raiz e abrem também por file://.
const icons = page => page === '404' ? partial('head-icons.html').replaceAll('"assets/', '"/assets/') : partial('head-icons.html');

function apply(html, block, content, file) {
  const pattern = new RegExp(`(<!-- ${block}:start -->\\n)[\\s\\S]*?(\\n[ \\t]*<!-- ${block}:end -->)`);
  if (!pattern.test(html)) throw new Error(`${file}: marcadores de ${block} não encontrados`);
  return html.replace(pattern, (_, start, end) => start + content + end);
}

// Mantém no HTML só os símbolos usados, incluindo o ícone de fechar trocado por ui.js.
// O filtro SVG da água pertence à hero e não faz parte deste sprite de ícones.
function symbols(html, file) {
  const sprite = partial('svg-symbols.html');
  const required = new Set([...html.matchAll(/<use\b[^>]*\bhref="#([^"]+)"/g)].map(match => match[1]));
  if (html.includes('data-menu-label')) required.add('k-close');
  const available = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]));
  for (const id of required) {
    if (!available.has(id)) throw new Error(`${file}: símbolo ${id} não encontrado no partial`);
  }
  return sprite.replace(/^[ \t]*<symbol id="([^"]+)"[^\n]+<\/symbol>\n?/gm,
    (symbol, id) => required.has(id) ? symbol : '');
}

function shared(html, file) {
  if (html.includes('<!-- blog-portal:start -->')) html = apply(html, 'blog-portal', blogPortal(posts, verse, file.startsWith('assets/') ? '' : 'assets/'), file);
  if (html.includes('<!-- materiais-catalogo:start -->')) html = apply(html, 'materiais-catalogo', materialCards(materials, file.startsWith('assets/') ? '' : 'assets/'), file);
  // Dobra de blog gerada a partir dos posts; no manual, os caminhos partem de assets/.
  if (html.includes('<!-- blog-destaque:start -->')) html = apply(html, 'blog-destaque', file.startsWith('assets/') ? blogFeature(posts, '', 'demo-blog') : blogFeature(posts), file);
  // As cenas têm fonte única; templates inertes evitam montar SVGs fora da dobra.
  if (html.includes('<!-- story-scenes:start -->')) html = apply(html, 'story-scenes', partial('story-scenes.html'), file);
  html = apply(html, 'symbols', symbols(html, file), file);
  // Posts não têm o botão flutuante: o bloco só entra onde houver marcador.
  if (html.includes('<!-- whatsapp:start -->')) html = apply(html, 'whatsapp', partial('whatsapp.html'), file);
  html = apply(html, 'toast', partial('toast.html'), file);
  return fillData(html, church, file);
}

const posts = await loadPosts(root);
const materials = loadMaterials(root);
const verse = JSON.parse(read(join(root, 'dados', 'versiculos.json'))).blog;
const pages = readdirSync(root).filter(file => file.endsWith('.html'));
const outputs = [];
for (const file of pages) {
  const page = file.replace(/\.html$/, '');
  const before = read(join(root, file));
  let html = apply(before, 'icons', icons(page), file);
  html = apply(html, 'header', header(page), file);
  html = apply(html, 'footer', partial('footer.html'), file);
  html = fillHead(html, church, page, file);
  if (html.includes('<!-- jsonld:start -->')) html = apply(html, 'jsonld', jsonLd(church), file);
  outputs.push({ file, before, html: shared(html, file) });
}
// O manual tem navegação própria; compartilha apenas ícones, WhatsApp e toast.
const manual = 'assets/design_system.html';
const before = read(join(root, manual));
outputs.push({ file: manual, before, html: shared(before, manual) });

// Posts: conteudo/blog/*.md → blog/[slug].html, com os mesmos partials; ícones com caminho ../ por estarem numa pasta.
for (const post of posts.filter(post => post.em_breve !== true)) {
  const file = `blog/${post.slug}.html`;
  const before = existsSync(join(root, file)) ? read(join(root, file)) : '';
  let html = apply(postPage(post, posts, church), 'icons', partial('head-icons.html').replaceAll('"assets/', '"../assets/'), file);
  html = apply(html, 'header', header('blog'), file);
  html = apply(html, 'footer', partial('footer.html'), file);
  outputs.push({ file, before, html: shared(html, file) });
}
const index = 'dados/posts.json';
outputs.push({ file: index, before: existsSync(join(root, index)) ? read(join(root, index)) : '', html: postsIndex(posts) });
mkdirSync(join(root, 'blog'), { recursive: true });

// Valida todos os marcadores antes de escrever qualquer página.
for (const { file, before, html } of outputs) {
  if (html !== before) writeFileSync(join(root, file), html);
  console.log(`${html === before ? 'igual   ' : 'alterada'} ${file}`);
}
