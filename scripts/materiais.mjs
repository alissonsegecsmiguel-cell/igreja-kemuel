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

const typeKey = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replaceAll(' ', '-');
export function materialCards(materials, prefix = 'assets/', home = false) {
  const local = path => escape(path.replace(/^assets\//, prefix));
  return `<div class="k-materials-grid${home ? ' k-materials-grid--home' : ''}">${materials.map(item => {
    const course = item.formato === 'Curso externo';
    const action = course ? 'Acessar curso' : 'Baixar PDF';
    const url = item.exemplo ? course ? 'https://example.invalid/curso' : 'https://example.invalid/material' : local(item.arquivo);
    const attrs = item.exemplo ? `data-example data-material-example${course ? ' target="_blank" rel="noopener noreferrer"' : ''}` : `download="${escape(item.nome_download)}"`;
    return `<article class="k-material-card" data-material-category="${typeKey(item.tipo)}"><a class="k-material-card__link" href="${url}" ${attrs} aria-label="${action}: ${escape(item.titulo)}${item.exemplo ? ', material de exemplo' : ''}${course ? ', plataforma externa de exemplo' : ''}"><div class="k-material-card__art"><img class="k-material-card__cover" src="${local(item.imagem_640 || item.imagem)}" srcset="${local(item.imagem_640 || item.imagem)} 640w, ${local(item.imagem)} 1280w" sizes="(min-width: 56.25rem) 30vw, ${home ? '66vw' : '90vw'}" width="${item.imagem_largura}" height="${item.imagem_altura}" loading="lazy" decoding="async" alt="${escape(item.imagem_alt || 'Capa da apostila ' + item.titulo)}"><span class="k-cover-title">${escape(item.titulo_capa)}</span>${item.exemplo ? '<span class="k-material-card__badge k-badge k-badge--neutral">Exemplo</span>' : ''}</div><div class="k-material-card__body"><p class="k-label">${escape(item.tipo)} · Nº ${escape(item.numero)}</p><h3 class="k-material-card__title">${escape(item.titulo)}</h3><p class="k-body-sm k-muted">${escape(item.descricao)}</p><span class="k-material-card__action">${action}<svg class="k-icon k-icon--small" aria-hidden="true"><use href="#${course ? 'k-external' : 'k-download'}"/></svg><span class="k-caption k-muted">${escape(item.formato)}${item.tamanho ? ' · '+escape(item.tamanho) : ''}</span></span></div></a><details class="k-material-card__credits"><summary class="k-caption">Crédito da imagem</summary><p class="k-caption k-muted">${escape(item.credito)}</p></details></article>`;
  }).join('')}</div>`;
}

export function materialsHeader(level = 2, id = 'materiais-home') {
  return `<header class="k-materials-header"><p class="k-eyebrow">Materiais</p><h${level} class="k-materials-header__title" id="${id}-titulo"><span>Estude a PALAVRA</span><span>no seu RITMO.</span></h${level}><div class="k-materials-header__bottom"><p>Guias, estudos e planos de leitura gratuitos para baixar, imprimir e compartilhar.</p><a class="k-link" href="/materiais">Ver todos os materiais<svg class="k-icon k-icon--small" aria-hidden="true"><use href="#k-arrow"/></svg></a></div></header>`;
}

export function materialsHome(materials, prefix = 'assets/') {
  return `${materialsHeader()}${materialCards(materials.slice(0,3),prefix,true)}`;
}

export function materialsPage(materials, prefix = 'assets/', level = 1, id = 'materiais') {
  const filters = [['todos','Todos'],['guia','Guias'],['plano-de-leitura','Planos de leitura'],['estudo','Estudos'],['devocional','Devocionais'],['curso','Cursos']];
  return `<div class="k-stack--large" data-materials>${materialsHeader(level,id)}<div class="k-materials-filter" role="group" aria-label="Filtrar materiais por tipo">${filters.map(([value,label])=>`<button class="k-blog-tab" type="button" data-material-filter="${value}" aria-pressed="${value==='todos'}">${label}</button>`).join('')}</div><p class="k-caption k-muted" data-material-count role="status" aria-live="polite">${materials.length} materiais</p><section class="k-stack" id="${id}" data-material-section aria-label="Materiais em PDF">${materialCards(materials.filter(m=>m.formato!=='Curso externo'),prefix)}</section><section class="k-stack" id="${id==='materiais'?'cursos':id+'-cursos'}" data-material-section aria-labelledby="${id}-cursos-titulo"><h2 id="${id}-cursos-titulo">Cursos em outra plataforma</h2>${materialCards(materials.filter(m=>m.formato==='Curso externo'),prefix)}</section></div>`;
}
