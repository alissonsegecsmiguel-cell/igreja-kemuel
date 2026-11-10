// Catálogo estático: a fonte única é dados/materiais.json. Não há fetch no navegador.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function loadMaterials(root) {
  const file = join(root, 'dados', 'materiais.json');
  if (!existsSync(file)) return [];
  const { materiais } = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(materiais)) throw new Error('materiais.json: materiais precisa ser uma lista');
  for (const item of materiais) {
    if (!item.titulo || !item.imagem || (!item.exemplo && (!item.arquivo || !item.nome_download))) throw new Error('Material sem título, capa ou download real');
    for (const path of [item.imagem, item.imagem_640, item.arquivo].filter(Boolean)) {
      if (!/^assets\/[a-z0-9/_-]+\.(webp|pdf)$/.test(path) || !existsSync(join(root, path))) throw new Error(`Material: arquivo local inválido ou ausente: ${path}`);
    }
  }
  return materiais;
}

export function materialCards(materials, prefix = 'assets/') {
  const local = path => escape(path.replace(/^assets\//, prefix));
  return `<div class="k-grid k-grid--3">${materials.map(item => `<article class="k-card k-material-card"><img class="k-material-card__cover" src="${local(item.imagem_640 || item.imagem)}" srcset="${local(item.imagem_640 || item.imagem)} 640w, ${local(item.imagem)} 1280w" sizes="(min-width: 60rem) 30vw, (min-width: 48rem) 45vw, 90vw" width="${item.imagem_largura}" height="${item.imagem_altura}" loading="lazy" decoding="async" alt="Capa da apostila ${escape(item.titulo)}"><div class="k-card__body"><p class="k-label">${escape(item.tipo)} · Nº ${escape(item.numero)}</p>${item.exemplo ? '<span class="k-badge">Exemplo</span>' : ''}<h3 class="k-h5">${escape(item.titulo)}</h3><p class="k-body-sm k-muted">${escape(item.descricao)}</p><p class="k-caption k-muted">${escape(item.formato)} · ${escape(item.paginas)} páginas · ${escape(item.tamanho)}</p>${item.exemplo ? '<button class="k-button k-button--secondary" type="button" data-example>Baixar PDF · exemplo</button>' : `<a class="k-button k-button--secondary" href="${local(item.arquivo)}" download="${escape(item.nome_download)}"><svg class="k-icon" aria-hidden="true"><use href="#k-download"/></svg>Baixar PDF<span class="k-sr-only">: ${escape(item.titulo)}</span></a>`}</div></article>`).join('')}</div>`;
}
