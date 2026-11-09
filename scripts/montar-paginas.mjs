// Aplica partials/ nas páginas .html da raiz e os blocos comuns no manual.
// Rodar antes do commit: node scripts/montar-paginas.mjs
// O resultado é HTML estático; a Vercel não executa este script.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const partial = name => read(join(root, 'partials', name)).trimEnd();

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
  // As cenas têm fonte única; templates inertes evitam montar SVGs fora da dobra.
  if (html.includes('<!-- story-scenes:start -->')) html = apply(html, 'story-scenes', partial('story-scenes.html'), file);
  html = apply(html, 'symbols', symbols(html, file), file);
  html = apply(html, 'whatsapp', partial('whatsapp.html'), file);
  return apply(html, 'toast', partial('toast.html'), file);
}

const pages = readdirSync(root).filter(file => file.endsWith('.html'));
const outputs = [];
for (const file of pages) {
  const page = file.replace(/\.html$/, '');
  const before = read(join(root, file));
  let html = apply(before, 'icons', icons(page), file);
  html = apply(html, 'header', header(page), file);
  html = apply(html, 'footer', partial('footer.html'), file);
  outputs.push({ file, before, html: shared(html, file) });
}
// O manual tem navegação própria; compartilha apenas ícones, WhatsApp e toast.
const manual = 'assets/design_system.html';
const before = read(join(root, manual));
outputs.push({ file: manual, before, html: shared(before, manual) });

// Valida todos os marcadores antes de escrever qualquer página.
for (const { file, before, html } of outputs) {
  if (html !== before) writeFileSync(join(root, file), html);
  console.log(`${html === before ? 'igual   ' : 'alterada'} ${file}`);
}
