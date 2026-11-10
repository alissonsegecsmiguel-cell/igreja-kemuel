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
  const fields = {
    nome: () => escape(d.nome),
    'cidade-nome': () => escape(d.cidade),
    'cidade-uf': () => escape(`${e.cidade} · ${e.uf}`),
    uf: () => escape(e.uf),
    bairro: () => escape(e.bairro),
    'rua-numero': () => escape(`${e.rua}, ${e.numero}`),
    'endereco-curto': () => escape(`${e.rua}, ${e.bairro}`),
    'endereco-regiao': () => escape(`${e.bairro} de ${e.cidade}, ${d.estado}`),
    'cultos-destaque': () => pairs(c => `<li class="k-service-times__item"><span class="k-service-times__day">${escape(c.dia)}</span><strong class="k-service-times__time">${escape(c.hora)}</strong></li>`, ''),
    endereco: () => `${e.rua}, ${e.numero} · ${e.bairro} · ${e.cidade} - ${e.uf}`,
    'endereco-linhas': () => `${e.rua}, ${e.numero}<br><span class="k-muted">${e.bairro} · ${e.cidade} - ${e.uf}</span>`,
    cidade: () => `${d.cidade}, ${d.estado}`,
    // Batismos: o número só existe em dados/igreja.json.
    'batismos-total': () => String(d.batismos.total),
    'batismos-aviso': () => d.batismos.provisorio ? 'Número provisório' : '',
    'instagram-usuario': () => d.redes.instagram.usuario,
    'youtube-usuario': () => d.redes.youtube.usuario,
    'nome-cidade': () => `${d.nome} · ${d.cidade}, ${d.estado}`,
    'cultos-resumo': () => pairs(c => `${c.dia}, ${c.hora}`, ' · '),
    'cultos-timeline': () => {
      const text = pairs(c => `${c.diaCurto} ${c.hora}`, ', ');
      return text[0].toUpperCase() + text.slice(1);
    },
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
  d.cultos.forEach((c, i) => {
    fields[`culto-${i}-dia`] = () => escape(c.dia);
    fields[`culto-${i}-detalhe`] = () => escape(`${i === 0 ? c.dia.toLowerCase() : c.diaPlural}, às ${c.hora}`);
    fields[`culto-${i}-numero`] = () => {
      const [, hour, suffix] = /^(\d+)(.*)$/.exec(c.hora) || ['', c.hora, ''];
      return `${escape(hour)}<small>${escape(suffix)}</small>`;
    };
  });
  return fields;
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
  // WhatsApp do discipulado: só com número oficial; sem ele, o botão leva ao fechamento da página.
  const whats = d.contato?.whatsapp; const digits = String(whats?.numero || '').replace(/\D/g, '');
  const discipleship = !whats?.exemplo && digits.length >= 10 ? `https://wa.me/${digits}?text=${encodeURIComponent('Olá! Quero participar do Discipulado Básico.')}` : '#participar';
  const urls = { mapa: d.mapa, 'whatsapp-discipulado': discipleship, ...Object.fromEntries(Object.entries(d.redes || {}).map(([key, rede]) => [key, rede.url])) };
  html = html.replace(/<a\b[^>]*\bdata-dado-href="([^"]+)"[^>]*>/g, (tag, key) => {
    if (!urls[key]) throw new Error(`${file}: data-dado-href="${key}" desconhecido`);
    return tag.replace(/(\s)href="[^"]*"/, (_, space) => `${space}href="${escape(urls[key])}"`);
  });
  const number = /^\[.*\]$/.test(d.endereco.numero) ? '' : `, ${d.endereco.numero}`;
  const mapQuery = `${d.nome}, ${d.endereco.rua}${number}, ${d.endereco.bairro}, ${d.endereco.cidade} - ${d.endereco.uf}`;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  return html.replace(/<iframe\b[^>]*\bdata-dado-src="mapa-embed"[^>]*>/g, tag => {
    // Sem src antes da proximidade: loading=lazy também é mantido na incorporação.
    const clean = tag.replace(/\sdata-src="[^"]*"/g, '');
    return clean.replace('data-dado-src="mapa-embed"', `data-dado-src="mapa-embed" data-src="${escape(mapEmbed)}"`);
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
  // og:image: logo horizontal claro sobre preto. Substitui as linhas anteriores para não duplicar.
  html = html.replace(/\n[ \t]*<meta property="og:image[^>]*>/g, '');
  const og = `${d.site}/assets/brand/og-igreja-kemuel.png`;
  html = html.replace(/(\n([ \t]*)<meta property="og:description"[^>]*>)/, (line, _, indent) =>
    `${line}\n${indent}<meta property="og:image" content="${og}">\n${indent}<meta property="og:image:width" content="1200">\n${indent}<meta property="og:image:height" content="630">\n${indent}<meta property="og:image:alt" content="Logo da Igreja Kemuel">`);
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
