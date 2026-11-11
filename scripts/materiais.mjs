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
    if (!item.titulo || !item.imagem || (item.arquivo && !item.nome_download)) throw new Error('Material sem título, capa ou nome de download');
    if (item.pagina && !item.chamada) throw new Error('Material com página precisa de chamada');
    for (const path of [item.imagem, item.imagem_640, item.arquivo].filter(Boolean)) {
      if (!/^assets\/[a-z0-9/_-]+\.(webp|pdf)$/.test(path) || !existsSync(join(root, path))) throw new Error(`Material: arquivo local inválido ou ausente: ${path}`);
    }
  }
  return materiais;
}

const typeKey = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replaceAll(' ', '-');
export function materialCards(materials, prefix = 'assets/', home = false, level = 2) {
  const local = path => escape(path.replace(/^assets\//, prefix));
  return `<div class="k-materials-grid${home ? ' k-materials-grid--home' : ''}">${materials.map(item => {
    const course = item.formato === 'Curso externo';
    const image = `<img class="k-material-cover__image" src="${local(item.imagem_640 || item.imagem)}" srcset="${local(item.imagem_640 || item.imagem)} 640w, ${local(item.imagem)} 1280w" sizes="(min-width: 56.25rem) 30vw, ${home ? '80vw' : '90vw'}" width="${item.imagem_largura}" height="${item.imagem_altura}" loading="lazy" decoding="async" alt="${escape(item.imagem_alt || 'Capa da apostila ' + item.titulo)}">`;
    // Capa real (apostila já diagramada) vai inteira; as demais seguem o modelo de capa de apostila.
    const cover = item.capa_real
      ? `<div class="k-material-cover k-material-cover--real">${image}</div>`
      : `<div class="k-material-cover"><div class="k-material-cover__top"><img class="k-material-cover__logo" src="${local('assets/brand/logo-horizontal-escuro.svg')}" alt="" width="120" height="44"><span class="k-material-cover__type">${escape(item.tipo)}</span></div><div class="k-material-cover__window">${image}</div><div class="k-material-cover__bottom"><span class="k-material-cover__title">${escape(item.titulo_capa)}</span><span class="k-material-cover__number">Nº ${escape(item.numero)}</span></div></div>`;
    // Metadados só com os campos existentes; nada de páginas ou tamanho inventados.
    const parts = item.metadados ? [item.metadados] : [item.formato, item.paginas ? `${item.paginas} páginas` : '', item.tamanho || ''].filter(Boolean);
    const meta = `<p class="k-material-card__meta"><svg class="k-icon k-icon--small" aria-hidden="true"><use href="#k-document"/></svg><span${item.pagina ? ' class="k-material-card__example"' : ''}>${parts.map(escape).join(' · ')}${item.exemplo ? ' · <span class="k-material-card__example">Exemplo</span>' : ''}</span></p>`;
    const text = `<h${level + 1} class="k-material-card__title">${escape(item.titulo)}</h${level + 1}><p class="k-material-card__description">${escape(item.descricao)}</p>`;
    const credits = `<details class="k-material-card__credits"><summary class="k-caption">Crédito da imagem</summary><p class="k-caption k-muted">${escape(item.credito)}</p></details>`;
    const category = `data-material-category="${typeKey(item.tipo)}"`;
    if (item.pagina) {
      return `<article class="k-material-card k-material-card--page" ${category}><a class="k-material-card__link" href="${escape(item.pagina)}">${cover}${meta}${text}<span class="k-button k-button--secondary k-material-card__button">${escape(item.chamada)}<svg class="k-icon" aria-hidden="true"><use href="#k-arrow"/></svg></span></a>${credits}</article>`;
    }
    const action = item.arquivo
      ? `<a class="k-button k-button--secondary k-material-card__button" href="${local(item.arquivo)}" download="${escape(item.nome_download)}">Baixar PDF<svg class="k-icon" aria-hidden="true"><use href="#k-download"/></svg><span class="k-sr-only">: ${escape(item.titulo)}</span></a>`
      : `<button class="k-button k-button--secondary k-material-card__button" type="button" aria-disabled="true">Em breve<span class="k-sr-only">: ${escape(item.titulo)}${course ? ', curso' : ''}</span></button>`;
    return `<article class="k-material-card" ${category}>${cover}${meta}${text}${action}${credits}</article>`;
  }).join('')}</div>`;
}

// Fechamento de /discipulado: o ÚNICO link do site para o PDF da apostila.
export function discipleshipDownload(materials, prefix = 'assets/') {
  const local = path => escape(path.replace(/^assets\//, prefix));
  const item = materials.find(m => m.pagina === '/discipulado' && m.arquivo);
  if (!item) throw new Error('Material do discipulado sem arquivo em dados/materiais.json');
  const label = [item.formato, item.tamanho].filter(Boolean).join(' · ');
  return `<div class="k-download-teaser"><img class="k-download-teaser__cover" src="${local(item.imagem_640 || item.imagem)}" srcset="${local(item.imagem_640 || item.imagem)} 640w, ${local(item.imagem)} 1280w" sizes="5rem" width="${item.imagem_largura}" height="${item.imagem_altura}" alt="" loading="lazy" decoding="async"><div class="k-download-teaser__body"><p class="k-download-teaser__question">Quer conhecer a apostila antes?</p><a class="k-button k-button--secondary" href="${local(item.arquivo)}" download="${escape(item.nome_download)}">Baixar a apostila (${escape(label)})<svg class="k-icon" aria-hidden="true"><use href="#k-download"/></svg></a>${item.paginas ? `<p class="k-download-teaser__meta">${item.paginas} páginas${item.exemplo ? ' · versão de exemplo' : ''}</p>` : ''}</div></div>`;
}

export function materialsHeader(level = 2, id = 'materiais-home') {
  return `<header class="k-materials-header"><p class="k-eyebrow">Materiais</p><h${level} class="k-materials-header__title" id="${id}-titulo"><span>Estude a PALAVRA</span> <span>no seu RITMO.</span></h${level}><div class="k-materials-header__bottom"><p>Guias, estudos e planos de leitura gratuitos para baixar, imprimir e compartilhar.</p><a class="k-link" href="/materiais">Ver todos os materiais<svg class="k-icon k-icon--small" aria-hidden="true"><use href="#k-arrow"/></svg></a></div></header>`;
}

export function materialsHome(materials, prefix = 'assets/') {
  return `${materialsHeader()}${materialCards(materials.slice(0,3),prefix,true)}`;
}

export function materialsPage(materials, prefix = 'assets/', level = 1, id = 'materiais') {
  const filters = [['todos','Todos'],['guia','Guias'],['plano-de-leitura','Planos de leitura'],['estudo','Estudos'],['devocional','Devocionais'],['curso','Cursos']];
  return `<div class="k-stack--large" data-materials>${materialsHeader(level,id)}<div class="k-materials-filter" role="group" aria-label="Filtrar materiais por tipo">${filters.map(([value,label])=>`<button class="k-blog-tab" type="button" data-material-filter="${value}" aria-pressed="${value==='todos'}">${label}</button>`).join('')}</div><p class="k-caption k-muted" data-material-count role="status" aria-live="polite">${materials.length} materiais</p><section class="k-stack" id="${id}" data-material-section aria-label="Materiais em PDF">${materialCards(materials.filter(m=>m.formato!=='Curso externo'),prefix,false,level)}</section><section class="k-stack" id="${id==='materiais'?'cursos':id+'-cursos'}" data-material-section aria-labelledby="${id}-cursos-titulo"><h2 id="${id}-cursos-titulo">Cursos em outra plataforma</h2>${materialCards(materials.filter(m=>m.formato==='Curso externo'),prefix,false,level+1)}</section></div>`;
}
