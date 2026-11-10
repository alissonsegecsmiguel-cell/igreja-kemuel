// Somente conteúdo público: nenhum corpo de artigo em breve entra no índice.
import { normalize } from '../assets/js/search.mjs';
const plain = html => html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n))).replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (_, key) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", nbsp: ' ' })[key]).replace(/\s+/g, ' ').trim();
export function searchIndex(posts) {
  return JSON.stringify(posts.map(p => {
    const texto = p.em_breve ? '' : plain(p.html);
    return { slug: p.slug, titulo: normalize(p.titulo), resumo: normalize(p.subtitulo || p.resumo), categoria: normalize(p.categoria), referencia: normalize(p.referencia), referencia_original: p.referencia || '', temas: p.temas.map(normalize), texto: normalize(texto), texto_original: texto };
  }), null, 2) + '\n';
}
