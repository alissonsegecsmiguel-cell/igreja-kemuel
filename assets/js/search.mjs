// Busca local Kemuel: funções puras, sem biblioteca, rede, DOM ou rastreamento.
export const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const stop = new Set('a o as os um uma de da do das dos e em no na nos nas para por com que quem como estou esta estamos meu minha quero querendo se ser deus'.split(' '));
const words = value => normalize(value).split(' ').filter(Boolean);
const allowance = word => word.length > 6 ? 2 : word.length >= 4 ? 1 : 0;

export function distance(a, b, max = Infinity) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]));
    if (Math.min(...row) > max) return max + 1;
    previous = row;
  }
  return previous[b.length];
}

// Jo é intencionalmente ambíguo; Jó acentuado identifica apenas Jó.
export function passage(value, books) {
  const raw = String(value).trim();
  const clean = normalize(raw).replace(/\s/g, '');
  let candidates = [], longest = 0, rest = '';
  for (const book of books) {
    if (/^jó(?:\s|\d|$)/i.test(raw) && book.nome !== 'Jó') continue;
    for (const alias of [book.nome, book.sem_acento, ...book.abreviacoes]) {
      const key = normalize(alias).replace(/\s/g, '');
      if (!clean.startsWith(key) || (clean[key.length] && !/\d/.test(clean[key.length]))) continue;
      if (key.length > longest) { candidates = []; longest = key.length; rest = clean.slice(key.length); }
      if (key.length === longest && !candidates.includes(book.sem_acento)) candidates.push(book.sem_acento);
    }
  }
  if (!candidates.length) return null;
  // Conserva separadores para distinguir capítulo, versículo e intervalo.
  const tail = raw.match(/(?:\d+\s*)?[^\d]+([\d][\s\S]*)$/)?.[1] || '';
  const parts = tail.match(/^(\d+)(?:\s*[.:,\s]\s*(\d+)(?:\s*[-–]\s*(\d+))?|\s*(?:a|[-–])\s*(\d+))?\s*$/i);
  if (rest && !parts) return null;
  return { books: candidates, chapter: parts ? Number(parts[1]) : null, verse: parts?.[2] ? Number(parts[2]) : null, endVerse: parts?.[3] ? Number(parts[3]) : null, endChapter: parts?.[4] ? Number(parts[4]) : null };
}

function overlaps(query, ref) {
  if (!ref || !query.books.some(b => ref.books.includes(b))) return false;
  if (!query.chapter || !ref.chapter) return true;
  if (query.chapter > (ref.endChapter || ref.chapter) || (query.endChapter || query.chapter) < ref.chapter) return false;
  if (!query.verse || !ref.verse || query.chapter !== ref.chapter) return true;
  return query.verse <= (ref.endVerse || ref.verse) && (query.endVerse || query.verse) >= ref.verse;
}

export const moods = [
  { id: 'ansioso', label: 'Ansioso', title: 'Para quem está ansioso', themes: ['confiança', 'tempestade', 'paz'] },
  { id: 'cansado', label: 'Cansado', title: 'Para quem está cansado', themes: ['descanso', 'força'] },
  { id: 'recomeco', label: 'Querendo recomeçar', title: 'Para quem quer recomeçar', themes: ['perdão', 'recomeço'] },
  { id: 'duvidas', label: 'Com dúvidas na fé', title: 'Para quem tem dúvidas na fé', themes: ['fé', 'Escrituras'] },
  { id: 'luto', label: 'Em luto', title: 'Para quem está em luto', themes: ['consolo', 'esperança'] },
  { id: 'grato', label: 'Grato', title: 'Para quem está grato', themes: ['gratidão', 'louvor'] }
];

export function createSearch(index, synonyms, books) {
  const fields = ['titulo', 'temas', 'referencia', 'categoria', 'resumo', 'texto'];
  const weights = [12, 8, 8, 6, 4, 1];
  const documents = index.map(post => ({ ...post, fields: fields.map(f => words(Array.isArray(post[f]) ? post[f].join(' ') : post[f])), passage: passage(post.referencia_original || post.referencia, books) }));
  const vocabulary = [...new Set(documents.flatMap(p => p.fields.flat()).filter(w => w.length >= 4 && !stop.has(w)))];
  const spellings = new Map();
  for (const text of [...index.map(p => p.texto_original), ...Object.keys(synonyms), ...Object.values(synonyms).flat()]) for (const word of String(text || '').match(/[\p{L}]+/gu) || []) spellings.set(normalize(word), word.toLowerCase());
  const aliases = Object.entries(synonyms).map(([key, themes]) => [normalize(key), themes.map(normalize)]);
  function search(value, { mood = '', category = 'todos' } = {}) {
    const query = normalize(value);
    const ref = query ? passage(value, books) : null;
    const allWords = words(query), significant = allWords.filter(w => !stop.has(w));
    const terms = significant.length ? significant : allWords;
    const expanded = aliases.filter(([alias]) => (` ${query} `).includes(` ${alias} `)).flatMap(([, themes]) => themes);
    const moment = moods.find(m => m.id === mood);
    const qualityCache = new Map();
    function quality(term, word) {
      const key = term + ':' + word;
      if (!qualityCache.has(key)) qualityCache.set(key, word === term ? 1 : term.length >= 2 && word.startsWith(term) ? .8 : allowance(term) && distance(term, word, allowance(term)) <= allowance(term) ? .5 : 0);
      return qualityCache.get(key);
    }
    const targetThemes = (moment?.themes || expanded).map(normalize);
    const hits = [];
    for (const post of documents) {
      if (category !== 'todos' && normalize(post.categoria).replace(/ /g, '-') !== category) continue;
      const thematic = targetThemes.length && post.temas.some(t => targetThemes.includes(t));
      let score = 0, found = [], bodyMatch = '';
      if (ref) { if (!overlaps(ref, post.passage)) continue; score = 40; }
      else if (moment) { if (!thematic) continue; score = 30; }
      else if (terms.length) {
        let complete = true;
        for (const term of terms) {
          let best = 0, match = '', field = -1;
          for (let f = 0; f < post.fields.length; f++) {
            for (const word of post.fields[f]) {
              const value = quality(term, word) * weights[f];
              if (value > best) { best = value; match = word; field = f; }
            }
          }
          if (!best) complete = false;
          else { score += best; found.push(match); if (field === 5) bodyMatch = match; }
        }
        if (!complete && !thematic) continue;
        if (thematic) score += 8;
      }
      hits.push({ post, score, words: found, bodyMatch });
    }
    hits.sort((a, b) => b.score - a.score || index.findIndex(p => p.slug === a.post.slug) - index.findIndex(p => p.slug === b.post.slug));
    let correction = '';
    if (!hits.length && !ref && terms.length) {
      let closest = Infinity;
      for (const term of terms) for (const word of vocabulary) {
        if (word === term) continue;
        const d = distance(term, word, allowance(term) + 1);
        if (d && d <= allowance(term) + 1 && d < closest) { closest = d; correction = word; }
      }
    }
    return { hits, correction: spellings.get(correction) || correction, ambiguous: ref?.books.length > 1, terms };
  }
  return { search };
}
