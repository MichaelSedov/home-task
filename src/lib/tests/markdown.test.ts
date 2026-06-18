import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '$lib/util/markdown.js';

describe('renderMarkdown', () => {
	it('wraps a single paragraph in <p>', () => {
		expect(renderMarkdown('hello')).toBe('<p>hello</p>');
	});

	it('splits paragraphs on blank lines', () => {
		expect(renderMarkdown('one\n\ntwo')).toBe('<p>one</p><p>two</p>');
	});

	it('converts single newlines to <br />', () => {
		expect(renderMarkdown('a\nb')).toBe('<p>a<br />b</p>');
	});

	it('renders **bold** and *italic*', () => {
		expect(renderMarkdown('**a** and *b*')).toBe('<p><strong>a</strong> and <em>b</em></p>');
	});

	it('escapes HTML in the source', () => {
		expect(renderMarkdown('<script>alert(1)</script>')).toBe(
			'<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>'
		);
	});

	it('escapes HTML inside bold/italic spans', () => {
		expect(renderMarkdown('**<b>x</b>**')).toBe('<p><strong>&lt;b&gt;x&lt;/b&gt;</strong></p>');
	});
});
