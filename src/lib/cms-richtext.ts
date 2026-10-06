function escapeHtml(value: string) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderInline(value: string) {
  let text = escapeHtml(value);

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g,
    (_match, label, url) => {
      const external = String(url).startsWith('http');
      return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    }
  );

  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return text;
}

export function renderRichText(value?: string) {
  const source = String(value ?? '').trim();
  if (!source) return '';

  return source
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);

      if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
        return `<ul>${lines
          .map((line) => `<li>${renderInline(line.replace(/^[-*]\s+/, ''))}</li>`)
          .join('')}</ul>`;
      }

      if (lines.length && lines.every((line) => /^\d+\.\s+/.test(line))) {
        return `<ol>${lines
          .map((line) => `<li>${renderInline(line.replace(/^\d+\.\s+/, ''))}</li>`)
          .join('')}</ol>`;
      }

      return `<p>${lines.map(renderInline).join('<br />')}</p>`;
    })
    .join('\n');
}

