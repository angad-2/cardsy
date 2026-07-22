// Minimal CSV parser for two-column (question,answer) uploads.
// Handles quoted fields with commas and escaped quotes ("").

function parseLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

// Returns [{ question, answer }] from raw CSV text. Skips a header row
// if it literally looks like "question,answer".
function parseQaCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const rows = [];
  lines.forEach((line, idx) => {
    const [question, answer] = parseLine(line);
    if (idx === 0 && /^question$/i.test((question || '').trim()) && /^answer$/i.test((answer || '').trim())) {
      return; // header row
    }
    if (question && answer) rows.push({ question: question.trim(), answer: answer.trim() });
  });
  return rows;
}

module.exports = { parseQaCsv };
