// Converte um rascunho de textos-blog/ (.md ou .docx) em conteudo/blog/[slug].md e gera as imagens .webp.
// Uso: node scripts/converter-post.mjs textos-blog/arquivo.docx   |   node scripts/converter-post.mjs --todos
// Dependências só de desenvolvimento (scripts/package.json): mammoth, sharp. Rodar antes: npm install --prefix scripts
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIELDS = {
  'categoria': 'categoria', 'temas': 'temas', 'autor': 'autor', 'data': 'data', 'referência bíblica': 'referencia', 'referencia biblica': 'referencia',
  'capa': 'capa', 'legenda da capa': 'capa_legenda', 'crédito da capa': 'capa_credito', 'credito da capa': 'capa_credito', 'foco da capa': 'capa_foco', 'exemplo': 'exemplo'
};

export const slugify = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const today = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local
function isoDate(text) {
  const br = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text.trim())) return text.trim();
  throw new Error(`Data inválida: "${text}" (use DD/MM/AAAA)`);
}

// Blocos neutros: { tipo: 'campo' | 'h1' | 'h2' | 'p', texto, italico }
function blocksFromMarkdown(source) {
  const blocks = [];
  for (const chunk of source.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').filter(line => line.trim());
    if (!lines.length) continue;
    // Campos podem vir em linhas seguidas, sem linha em branco entre eles.
    if (lines.every(line => fieldOf(line))) { lines.forEach(line => blocks.push({ tipo: 'campo', texto: line.trim() })); continue; }
    const text = lines.join(' ').trim();
    if (text.startsWith('## ')) blocks.push({ tipo: 'h2', texto: text.slice(3).trim() });
    else if (text.startsWith('# ')) blocks.push({ tipo: 'h1', texto: text.slice(2).trim() });
    else {
      const italic = /^\*[^*].*\*$/.test(text) || /^_[^_].*_$/.test(text);
      blocks.push({ tipo: 'p', texto: italic ? text.slice(1, -1) : text, italico: italic });
    }
  }
  return blocks;
}

// .docx: remove os parágrafos cinza de orientação antes de converter (mammoth não lê cores).
async function blocksFromDocx(path) {
  const { default: JSZip } = await import('jszip');
  const mammoth = (await import('mammoth')).default;
  const zip = await JSZip.loadAsync(readFileSync(path));
  const xml = await zip.file('word/document.xml').async('string');
  const isGray = hex => { const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)); return r === g && g === b && r >= 0x60 && r <= 0xcc; };
  const cleaned = xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, paragraph => {
    const runs = [...paragraph.matchAll(/<w:r[ >][\s\S]*?<\/w:r>/g)].map(m => m[0]).filter(run => /<w:t[ >]/.test(run));
    const gray = runs.length && runs.every(run => { const c = run.match(/<w:color w:val="([0-9A-Fa-f]{6})"/); return c && isGray(c[1]); });
    return gray ? '' : paragraph;
  });
  zip.file('word/document.xml', cleaned);
  const { value } = await mammoth.convertToHtml({ buffer: await zip.generateAsync({ type: 'nodebuffer' }) });
  const toMd = html => html.replace(/<strong>(.*?)<\/strong>/g, '**$1**').replace(/<em>(.*?)<\/em>/g, '*$1*').replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
  const blocks = [];
  for (const [, tag, inner] of value.matchAll(/<(h1|h2|p)>([\s\S]*?)<\/\1>/g)) {
    const md = toMd(inner);
    if (!md) continue;
    const plain = md.replace(/\*\*/g, '');
    if (tag !== 'p') { blocks.push({ tipo: tag, texto: plain.replace(/\*/g, '') }); continue; }
    if (fieldOf(plain)) { blocks.push({ tipo: 'campo', texto: plain }); continue; }
    const italic = /^\*[^*].*\*$/.test(md);
    blocks.push({ tipo: 'p', texto: italic ? md.slice(1, -1) : plain.replace(/^\*\*(CITAÇÃO|IMAGEM):\*\*/, '$1:'), italico: italic });
  }
  return blocks;
}

function fieldOf(line) {
  const m = line.trim().match(/^([^:]{3,25}):\s*(.*)$/);
  if (!m) return null;
  const key = FIELDS[m[1].trim().toLowerCase()];
  return key ? [key, m[2].trim()] : null;
}

async function convert(file) {
  const path = resolve(file);
  const blocks = extname(path).toLowerCase() === '.docx' ? await blocksFromDocx(path) : blocksFromMarkdown(readFileSync(path, 'utf8'));
  const meta = {}; const body = []; let title = null; let subtitle = null;
  for (const block of blocks) {
    if (block.tipo === 'campo' && !title) { const [k, v] = fieldOf(block.texto); if (v) meta[k] = v; continue; }
    if (block.tipo === 'h1') { if (title) throw new Error('Mais de um Título 1 no documento.'); title = block.texto; continue; }
    if (!title) continue; // cabeçalhos do modelo antes dos campos e do título
    if (block.tipo === 'p' && block.italico && subtitle === null && !body.length) { subtitle = block.texto; continue; }
    body.push(block);
  }
  if (!title) throw new Error(`${basename(path)}: falta o título (Título 1 ou "# ").`);
  const themes = [...new Set((meta.temas || '').split(/[,;]/).map(t => t.trim()).filter(Boolean))];
  if (themes.length < 2 || themes.length > 4) throw new Error('Informe Temas: com 2 a 4 temas separados por vírgula.');
  const slug = slugify(title);
  const source = dirname(path);
  const imgDir = join(root, 'assets', 'img', 'blog', slug);
  mkdirSync(imgDir, { recursive: true });
  const sharp = (await import('sharp')).default;
  const findImage = name => {
    const candidate = [join(source, name), join(source, 'imagens', name)].find(existsSync);
    if (!candidate) throw new Error(`Imagem não encontrada em textos-blog: ${name}`);
    return candidate;
  };
  // Capa 3:2 em 480, 960 e 1600 px, recortada em volta do "Foco da capa" (x% y%, padrão no centro).
  // Imagens internas com 960 px de largura, proporção original.
  if (meta.capa) {
    const src = findImage(meta.capa);
    const { width: w, height: h } = await sharp(src).metadata();
    const [fx, fy] = (meta.capa_foco || '50% 50%').match(/\d+(\.\d+)?/g).map(v => Number(v) / 100);
    const cw = Math.min(w, Math.round(h * 3 / 2)), ch = Math.round(cw * 2 / 3);
    const left = Math.round(Math.min(w - cw, Math.max(0, fx * w - cw / 2)));
    const top = Math.round(Math.min(h - ch, Math.max(0, fy * h - ch / 2)));
    for (const width of [480, 960, 1600]) { // 480 nas listas, 960 e 1600 no post
      await sharp(src).extract({ left, top, width: cw, height: ch }).resize({ width, height: Math.round(width * 2 / 3) }).webp({ quality: 80, effort: 6 }).toFile(join(imgDir, `capa-${width}.webp`));
    }
  }
  const lines = [];
  for (const block of body) {
    if (block.tipo === 'h2') { lines.push(`## ${block.texto}`); continue; }
    const quote = block.texto.match(/^\**CITAÇÃO:\**\s*(.*)$/i);
    if (quote) { lines.push(`> ${quote[1].trim()}`); continue; }
    const image = block.texto.match(/^\**IMAGEM:\**\s*(.*)$/i);
    if (image) {
      const [name, caption = '', credit = ''] = image[1].split('|').map(part => part.trim());
      const out = `${slugify(basename(name, extname(name)))}-960.webp`;
      await sharp(findImage(name)).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(join(imgDir, out));
      lines.push(`![${caption.replace(/[\[\]]/g, '')}](${out} "${credit.replace(/"/g, "'")}")`);
      continue;
    }
    lines.push(block.texto);
  }
  const q = value => JSON.stringify(value);
  const front = [
    '---',
    `titulo: ${q(title)}`,
    `subtitulo: ${q(subtitle || '')}`,
    `categoria: ${q(meta.categoria || 'Blog')}`,
    `temas: ${q(themes)}`,
    `autor: ${q(meta.autor || 'Igreja Kemuel')}`, // nunca inventar autor
    `data: ${meta.data ? isoDate(meta.data) : today()}`,
    `referencia: ${q(meta.referencia || '')}`,
    `capa: ${meta.capa ? q('capa') : q('')}`,
    `capa_legenda: ${q(meta.capa_legenda || '')}`,
    `capa_credito: ${q(meta.capa_credito || '')}`,
    `exemplo: ${/^(sim|true|s)$/i.test(meta.exemplo || '') ? 'true' : 'false'}`,
    '---', ''
  ].join('\n');
  mkdirSync(join(root, 'conteudo', 'blog'), { recursive: true });
  writeFileSync(join(root, 'conteudo', 'blog', `${slug}.md`), front + lines.join('\n\n') + '\n');
  console.log(`convertido ${basename(path)} → conteudo/blog/${slug}.md`);
  return slug;
}

const args = process.argv.slice(2);
const inbox = join(root, 'textos-blog');
const files = args.includes('--todos')
  ? readdirSync(inbox).filter(f => /\.(md|docx)$/i.test(f) && !/^leiame/i.test(f) && statSync(join(inbox, f)).isFile()).map(f => join(inbox, f))
  : args;
if (!files.length) { console.log('Uso: node scripts/converter-post.mjs textos-blog/arquivo.docx | --todos'); process.exit(1); }
for (const file of files) await convert(file);
