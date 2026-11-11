// Recomprime as imagens publicadas a partir das pastas "originais", com os mesmos nomes e tamanhos.
// Rodar depois de trocar ou acrescentar uma imagem: node scripts/otimizar-imagens.mjs (precisa de sharp: npm install --prefix scripts)
// Depois, node scripts/montar-paginas.mjs troca por <picture> os <img> que tiverem versão AVIF.
//
// Fonte de cada família (arquivos [nome]-[largura].webp de uma pasta):
//   1. o original com a mesma proporção (materiais/originais/NN-nome.jpg, blog/originais/NN-slug.jpg,
//      ou textos-blog/imagens/ para as capas dos posts publicados, quando a pasta existir);
//   2. senão, uma cópia mestre da maior versão publicada, guardada uma única vez em [área]/originais/mestres/
//      (recortes como a capa 3:2 do post e a moeda quadrada não têm original com a mesma proporção).
// Metas: até 70 KB abaixo de 700 px, 120 KB abaixo de 1100 px e 200 KB acima. Qualidade 72; se passar da meta, desce até 62.
import { readdirSync, existsSync, mkdirSync, copyFileSync, statSync, writeFileSync, readFileSync, renameSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// No Windows o sharp segura o arquivo aberto: tudo é lido para a memória antes de processar.
sharp.cache(false);
const load = path => sharp(readFileSync(path));
const save = (path, data) => {
  if (existsSync(path) && readFileSync(path).equals(data)) return;
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, data);
  renameSync(temporary, path);
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const img = join(root, 'assets', 'img');
// Capas dos posts publicados: os originais ficam em textos-blog/ (fora do Git); sem eles, vale a cópia mestre.
const POST_ORIGINALS = {
  'deixaram-as-redes': 'chamado-duccio.jpg',
  'o-que-os-manuscritos-do-mar-morto-nos-contam': 'rolo-de-isaias-cap53.jpg',
  'quando-a-tempestade-nao-passa': 'tempestade-hitda.jpg',
  'quem-e-o-meu-proximo': 'samaritano-rossano.jpg',
  'uma-lampada-para-os-meus-pes': 'lamparina-met.jpg'
};
// Imagens que podem ser LCP ganham também AVIF: capa do post (página do post e destaque do /blog) e a capa da apostila (primeiro card de /materiais).
const AVIF = new Set(['capa', 'discipulado-basico-capa']);
const target = width => width < 700 ? 70 * 1024 : width < 1100 ? 120 * 1024 : 200 * 1024;

function families(dir) {
  const groups = new Map();
  for (const file of readdirSync(dir).filter(f => f.endsWith('.webp'))) {
    const match = file.match(/^(.*?)(?:-(\d+))?\.webp$/);
    const base = match[1];
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(file);
  }
  return groups;
}

function original(area, dir, base) {
  const folder = join(img, area, 'originais');
  if (area === 'materiais' && existsSync(folder)) return readdirSync(folder).filter(f => f.endsWith(`-${base}.jpg`)).map(f => join(folder, f))[0];
  if (area === 'blog' && base === 'capa-card') {
    const slug = dir.split(/[\\/]/).pop();
    const archived = join(folder, 'mestres', slug, 'capa-card-original.jpg');
    if (existsSync(archived)) return archived;
    const draft = POST_ORIGINALS[slug] && join(root, 'textos-blog', 'imagens', POST_ORIGINALS[slug]);
    if (draft && existsSync(draft)) {
      // Preserva a fonte licenciada também em um clone sem textos-blog/.
      mkdirSync(dirname(archived), { recursive: true });
      copyFileSync(draft, archived);
      return archived;
    }
    return existsSync(folder) ? readdirSync(folder).filter(f => f.endsWith(`-${slug}.jpg`)).map(f => join(folder, f))[0] : undefined;
  }
  return undefined;
}

const log = [];
for (const [area, dirs] of [['materiais', ['']], ['contribua', ['']], ['blog', readdirSync(join(img, 'blog')).filter(d => d !== 'originais' && statSync(join(img, 'blog', d)).isDirectory())]]) {
  for (const sub of dirs) {
    const dir = join(img, area, sub);
    for (const [base, files] of families(dir)) {
      // Imagens internas dos posts (nome-960.webp) e famílias de um arquivo só sem largura no nome ficam como estão, exceto a capa da apostila.
      if (area === 'blog' && !/^capa(-card)?$/.test(base)) continue;
      const variants = await Promise.all(files.map(async file => ({ file, ...(await load(join(dir, file)).metadata()) })));
      variants.sort((a, b) => b.width - a.width);
      const largest = variants[0];
      let source = original(area, dir, base);
      if (source) {
        const meta = await load(source).metadata();
        if (Math.abs(meta.width / meta.height - largest.width / largest.height) > 0.01) source = undefined;
      }
      if (!source) {
        source = join(img, area, 'originais', 'mestres', sub, largest.file);
        if (!existsSync(source)) { mkdirSync(dirname(source), { recursive: true }); copyFileSync(join(dir, largest.file), source); }
      }
      const input = readFileSync(source);
      for (const v of variants) {
        const resize = image => image.rotate().resize({ width: v.width, height: v.height, fit: 'cover' });
        let quality = 72, data;
        for (; quality >= 62; quality -= 2) {
          data = await resize(sharp(input)).webp({ quality, effort: 6 }).toBuffer();
          if (data.length <= target(v.width)) break;
        }
        quality = Math.max(quality, 62);
        save(join(dir, v.file), data);
        let avif = '';
        if (AVIF.has(base)) {
          const out = await resize(sharp(input)).avif({ quality: 50, effort: 6 }).toBuffer();
          save(join(dir, v.file.replace(/\.webp$/, '.avif')), out);
          avif = ` · avif ${Math.round(out.length / 1024)} KB`;
        }
        const over = data.length > target(v.width) ? ' · ACIMA DA META' : '';
        log.push(`${relative(root, join(dir, v.file)).replaceAll('\\', '/')} ${v.width}×${v.height} q${quality} ${Math.round(data.length / 1024)} KB (${relative(root, source).replaceAll('\\', '/')})${avif}${over}`);
      }
    }
  }
}
console.log(log.join('\n'));
