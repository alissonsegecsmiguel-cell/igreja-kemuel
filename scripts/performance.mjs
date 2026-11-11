// Otimizações de entrega: fontes e componentes continuam editados nos arquivos-fonte.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { transform } from 'lightningcss';
import { build } from 'esbuild';

export async function prepareAssets(root) {
  const read = path => readFileSync(resolve(root, path));
  const save = (path, data) => {
    const dest = resolve(root, path);
    if (!existsSync(dest) || !readFileSync(dest).equals(Buffer.from(data))) writeFileSync(dest, data);
  };
  const version = (base, data) => {
    const hash = createHash('sha256').update(data).digest('hex').slice(0, 12);
    const name = base.replace('.min.', `.${hash}.min.`);
    save(base, data);
    save(name, data);
    return name;
  };
  const css = transform({ filename: 'site.css', code: Buffer.concat([read('assets/css/tokens.css'), Buffer.from('\n'), read('assets/css/components.css')]), minify: true }).code;
  const styles = version('assets/css/site.min.css', css);
  const scripts = {};
  for (const [name, module] of [['ui', false], ['blog-search', true]]) {
    const result = await build({ entryPoints: [resolve(root, `assets/js/${name}.js`)], bundle: module, minify: true, write: false, target: 'es2020', ...(module ? { format: 'esm' } : {}) });
    scripts[name] = version(`assets/js/${name}.min.js`, result.outputFiles[0].contents);
  }
  return (html, file) => {
    const prefix = file.startsWith('blog/') ? '../' : file.startsWith('assets/') ? '../' : file === '404.html' ? '/' : '';
    html = html.replace(/\s*<link rel="stylesheet" href="[^"]*assets\/css\/(?:tokens|components|site(?:\.[a-f0-9]+)?\.min)\.css(?:\?[^"]*)?">/g, '');
    // O manual usa caminhos relativos ao próprio assets/.
    if (file.startsWith('assets/')) html = html.replace(/\s*<link rel="stylesheet" href="css\/(?:tokens|components)\.css">/g, '');
    html = html.replace(/\s*<link\b[^>]*data-performance-font[^>]*>/g, '');
    const font = file.startsWith('blog/') ? 'newsreader-latin-variable.woff2' : 'outfit-latin-variable.woff2';
    html = html.replace('</head>', `  <link rel="preload" href="${prefix}assets/fonts/${font}" as="font" type="font/woff2" crossorigin data-performance-font>\n  <link rel="stylesheet" href="${prefix}${styles}">\n</head>`);
    for (const [name, asset] of Object.entries(scripts)) {
      html = html.replace(new RegExp(`(<script\\b[^>]*src=")[^"]*(?:assets/)?js/${name}(?:\\.[a-f0-9]+)?(?:\\.min)?\\.js(?:\\?[^"]*)?("[^>]*>)`, 'g'), `$1${prefix}${asset}$2`);
    }
    // Remontagem idempotente: desfaz apenas os pictures gerados por este passo.
    html = html.replace(/<picture data-performance-picture>[\s\S]*?(<img\b[^>]*>)<\/picture>/g, '$1');
    let firstMaterial = false;
    html = html.replace(/<img\b[^>]*>/g, original => {
      let img = original;
      const src = img.match(/\bsrc="([^"]+)"/)?.[1];
      if (!src || !src.endsWith('.webp')) return img;
      // Imagens lazy usam a caixa real; evita escolher 1280px para uma janela de capa de ~300px.
      if (img.includes('loading="lazy"')) img = img.replace(/sizes="(?!auto, )/g, 'sizes="auto, ');
      if (file === 'materiais.html' && !firstMaterial && img.includes('k-material-cover__image')) {
        firstMaterial = true;
        img = img.replace(/\sloading="lazy"/, '').replace(/\sfetchpriority="high"/, '').replace('sizes="auto, ', 'sizes="').replace('<img', '<img fetchpriority="high"');
      }
      const local = url => resolve(root, url.startsWith('/') ? url.slice(1) : dirname(file) + '/' + url);
      const avif = url => url.replace(/\.webp$/, '.avif');
      const candidates = (img.match(/\bsrcset="([^"]+)"/)?.[1] || src).split(',').map(s => s.trim().split(/\s+/));
      if (!candidates.every(([url]) => existsSync(local(avif(url))))) return img;
      const sizes = img.match(/\bsizes="([^"]+)"/)?.[1];
      return `<picture data-performance-picture><source type="image/avif" srcset="${candidates.map(([url, width]) => avif(url) + (width ? ' ' + width : '')).join(', ')}"${sizes ? ` sizes="${sizes}"` : ''}>${img}</picture>`;
    });
    return html;
  };
}
