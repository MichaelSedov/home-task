import type { RequestHandler } from './$types';
import { getPost } from '$lib/server/data/posts.js';

export const config = { runtime: 'edge' };

export const GET: RequestHandler = ({ params }) => {
	const post = getPost(params.slug);
	const title = post?.translations['en']?.title ?? params.slug;
	const color = post?.coverColor ?? '#6d28d9';

	// Minimal SVG OG image — replace with satori for production
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${color}"/>
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="rgba(0,0,0,0.45)"/>
  <text x="120" y="200" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="rgba(255,255,255,0.7)">Demo Co.</text>
  <foreignObject x="120" y="240" width="960" height="280">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:system-ui,sans-serif;font-size:52px;font-weight:800;color:white;line-height:1.2;word-wrap:break-word;">
      ${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>
  </foreignObject>
</svg>`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
