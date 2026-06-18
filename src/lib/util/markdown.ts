const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

function escapeHtml(s: string): string {
	return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * Minimal markdown → HTML for trusted post bodies:
 * paragraphs (blank-line separated), single line breaks, **bold**, *italic*.
 * Input is HTML-escaped first so authored markdown cannot inject tags.
 */
export function renderMarkdown(text: string): string {
	return text
		.split('\n\n')
		.map((p) => {
			const safe = escapeHtml(p)
				.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
				.replace(/\*(.+?)\*/g, '<em>$1</em>')
				.replace(/\n/g, '<br />');
			return `<p>${safe}</p>`;
		})
		.join('');
}
