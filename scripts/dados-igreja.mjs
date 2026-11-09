// Preenche os dados da igreja (dados/igreja.json) nas páginas: elementos com data-dado,
// links com data-dado-href, metadados do <head> e o JSON-LD da página inicial.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function loadData(root) {
  return JSON.parse(readFileSync(join(root, 'dados', 'igreja.json'), 'utf8'));
}

function generators(d) {
  const e = d.endereco;
  const pairs = (fn, joiner) => d.cultos.map(fn).join(joiner);
  const icon = '<svg class="k-icon" aria-hidden="true"><use href="#k-clock"/></svg>';
  return {
    endereco: () => `${e.rua}, ${e.numero} · ${e.bairro} · ${e.cidade} - ${e.uf}`,
    'endereco-linhas': () => `${e.rua}, ${e.numero}<br><span class="k-muted">${e.bairro} · ${e.cidade} - ${e.uf}</span>`,
    cidade: () => `${d.cidade}, ${d.estado}`,
    'instagram-usuario': () => d.redes.instagram.usuario,
    'youtube-usuario': () => d.redes.youtube.usuario,
    'nome-cidade': () => `${d.nome} · ${d.cidade}, ${d.estado}`,
    'cultos-resumo': () => pairs(c => `${c.dia}, ${c.hora}`, ' · '),
    // "Quintas às 19h30 e domingos às 18h"
    'cultos-curto': () => {
      const items = d.cultos.map(c => `${c.diaCurto} às ${c.hora}`);
      const text = items.length > 1 ? `${items.slice(0, -1).join(', ')} e ${items.at(-1)}` : items[0];
      return text[0].toUpperCase() + text.slice(1);
    },
    // "às quintas-feiras, às 19h30, e aos domingos, às 18h"
    'cultos-frase': () => {
      const items = d.cultos.map(c => `${c.diaPlural.startsWith('domingo') || c.diaPlural.startsWith('sábado') ? 'aos' : 'às'} ${c.diaPlural}, às ${c.hora}`);
      return items.length > 1 ? `${items.slice(0, -1).join(', ')}, e ${items.at(-1)}` : items[0];
    },
    'cultos-schedule': () => pairs(c => `<li class="k-schedule__item"><span class="k-schedule__head">${icon}<span class="k-schedule__mark"></span></span><span class="k-eyebrow k-schedule__day">${c.dia}</span><span class="k-schedule__time">${c.hora}</span><span class="k-schedule__label">${c.nome}</span></li>`, ''),
    'cultos-biblia': () => pairs(c => `<li><span>${c.dia}</span><strong>${c.hora}</strong><small>${c.nome}</small></li>`, ''),
    'cultos-tabela': () => pairs(c => `<tr><th scope="row">${c.dia}</th><td>${c.hora}</td></tr>`, '') + `<tr><th scope="row">Endereço</th><td class="k-info-table__address">${e.rua}, ${e.numero} · ${e.bairro} · ${e.cidade} - ${e.uf}</td></tr>`
  };
}

// Fecha a tag certa mesmo com elementos iguais aninhados.
function closingIndex(html, tag, from) {
  const pattern = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  pattern.lastIndex = from;
  let depth = 1, match;
  while ((match = pattern.exec(html))) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return match.index;
  }
  throw new Error(`fechamento de <${tag}> não encontrado`);
}

export function fillData(html, d, file) {
  const gen = generators(d);
  const open = /<([a-z0-9]+)\b[^>]*\bdata-dado="([^"]+)"[^>]*>/gi;
  let out = '', last = 0, match;
  while ((match = open.exec(html))) {
    const [tagText, tag, name] = match;
    if (!gen[name]) throw new Error(`${file}: data-dado="${name}" desconhecido`);
    const start = match.index + tagText.length;
    const end = closingIndex(html, tag, start);
    out += html.slice(last, start) + gen[name]();
    last = end; open.lastIndex = end;
  }
  html = out + html.slice(last);
  // data-dado-href="mapa" ou o nome de uma rede em dados/igreja.json define o href do link.
  const urls = { mapa: d.mapa, ...Object.fromEntries(Object.entries(d.redes || {}).map(([key, rede]) => [key, rede.url])) };
  return html.replace(/<a\b[^>]*\bdata-dado-href="([^"]+)"[^>]*>/g, (tag, key) => {
    if (!urls[key]) throw new Error(`${file}: data-dado-href="${key}" desconhecido`);
    return tag.replace(/\bhref="[^"]*"/, `href="${escape(urls[key])}"`);
  });
}

export function fillHead(html, d, page, file) {
  const info = d.paginas[page];
  if (!info) throw new Error(`${file}: página sem metadados em dados/igreja.json`);
  const title = `${info.titulo ? `${info.titulo} · ` : ''}${d.nome} · ${d.cidade}, ${d.uf}`;
  const set = (pattern, value) => {
    if (!pattern.test(html)) throw new Error(`${file}: ${pattern} não encontrado`);
    html = html.replace(pattern, (_, a, b) => a + value + b);
  };
  set(/(<title>)[^<]*(<\/title>)/, escape(title));
  set(/(<meta name="description" content=")[^"]*(")/, escape(info.descricao));
  set(/(<meta property="og:title" content=")[^"]*(")/, escape(title));
  set(/(<meta property="og:description" content=")[^"]*(")/, escape(info.descricao));
  return html;
}

// JSON-LD da igreja. Número ainda marcado com colchetes fica fora do endereço.
export function jsonLd(d) {
  const e = d.endereco;
  const number = /^\[.*\]$/.test(e.numero) ? '' : `, ${e.numero}`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: d.nome,
    url: `${d.site}/`,
    hasMap: d.mapa,
    sameAs: Object.values(d.redes || {}).map(rede => rede.url),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${e.rua}${number}, ${e.bairro}`,
      addressLocality: e.cidade,
      addressRegion: e.uf,
      addressCountry: d.pais
    },
    openingHoursSpecification: d.cultos.map(c => ({
      '@type': 'OpeningHoursSpecification',
      name: c.nome,
      dayOfWeek: `https://schema.org/${c.diaSchema}`,
      opens: c.horaISO
    }))
  };
  // < escapado: o bloco não pode fechar o script por acidente.
  const json = JSON.stringify(data, null, 2).replaceAll('<', '\\u003c').split('\n').map(line => `  ${line}`).join('\n');
  return `  <script type="application/ld+json">\n${json}\n  </script>`;
}
