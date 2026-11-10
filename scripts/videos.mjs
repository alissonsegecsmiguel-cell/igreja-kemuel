// Vídeos do discipulado (dados/videos.json). Enquanto youtube_id for null, mostra o player de exemplo.
// Com youtube_id, uma fachada leve: o iframe youtube-nocookie só nasce no clique (ui.js).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function loadVideos(root) {
  const file = join(root, 'dados', 'videos.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
}

// showTitle: o título aparece dentro do player; nos depoimentos ele fica só na legenda abaixo.
export function videoSlot(video, uid, showTitle = true) {
  const format = video.formato === 'vertical' ? 'vertical' : 'horizontal';
  const title = esc(video.titulo);
  const caption = `${showTitle ? `<span class="k-video-slot__title">${title}</span>` : ''}<span class="k-video-slot__duration">${esc(video.duracao)}</span>`;
  if (video.youtube_id) {
    const id = esc(video.youtube_id);
    return `<div class="k-video-slot k-video-slot--${format}"><button class="k-video-slot__facade" type="button" data-video-id="${id}" data-video-title="${title}" aria-label="Assistir: ${title}"><img class="k-video-slot__poster" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async"><span class="k-video-slot__play" aria-hidden="true"><svg class="k-icon"><use href="#k-play"/></svg></span></button>${caption}</div>`;
  }
  return `<div class="k-video-slot k-video-slot--${format} k-video-slot--example" data-video-example><span class="k-video-slot__bg" aria-hidden="true"></span><span class="k-video-slot__tag">Vídeo de exemplo</span><span class="k-tooltip k-video-slot__center"><button class="k-video-slot__play" type="button" aria-disabled="true" aria-label="Assistir: ${title}" aria-describedby="${uid}-dica"><svg class="k-icon" aria-hidden="true"><use href="#k-play"/></svg></button><span id="${uid}-dica" role="tooltip">Vídeo em breve</span></span>${caption}</div>`;
}

export function testimonials(list = []) {
  return `<ul class="k-testimonials" role="list">${list.map((video, i) => `<li><figure class="k-testimonials__item">${videoSlot(video, `depoimento-${i + 1}`, false)}<figcaption>${esc(video.titulo)}</figcaption></figure></li>`).join('')}</ul>`;
}

// Fundo do fechamento: vídeo local mudo (só com arquivo) ou espaço da foto real.
export function closingBackground(bg = {}) {
  if (bg.arquivo) {
    return `<video class="k-closing__video" data-bg-video muted loop playsinline preload="none"${bg.poster ? ` poster="${esc(bg.poster)}"` : ''} aria-hidden="true"><source src="${esc(bg.arquivo)}" type="video/mp4"></video>`;
  }
  return `<figure class="k-photo-slot k-photo-slot--fill" aria-hidden="true"><span class="k-photo-slot__tag">Vídeo de fundo em breve</span><span class="k-photo-slot__label">Foto real</span><span>Igreja reunida num culto ou batismo</span></figure>`;
}
