// Aplica partials/ nas páginas .html da raiz. Rodar antes do commit: node scripts/montar-paginas.mjs
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

function apply(html, block, content, file) {
  const pattern = new RegExp(`(<!-- ${block}:start -->\\n)[\\s\\S]*?(\\n[ \\t]*<!-- ${block}:end -->)`);
  if (!pattern.test(html)) throw new Error(`${file}: marcadores de ${block} não encontrados`);
  return html.replace(pattern, (_, start, end) => start + content + end);
}

const pages = readdirSync(root).filter(file => file.endsWith('.html'));
for (const file of pages) {
  const page = file.replace(/\.html$/, '');
  const before = read(join(root, file));
  let html = apply(before, 'header', header(page), file);
  html = apply(html, 'footer', partial('footer.html'), file);
  writeFileSync(join(root, file), html);
  console.log(`${html === before ? 'igual   ' : 'alterada'} ${file}`);
}
