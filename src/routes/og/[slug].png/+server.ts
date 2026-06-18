import type { RequestHandler } from './$types';
import { ImageResponse } from '@vercel/og';
import { getPost } from '$lib/server/data/posts.js';

// Edge runtime + @vercel/og (satori + resvg-wasm) renders a real PNG that
// Facebook, X, and LinkedIn can use for og:image previews. SVG was nice and
// cheap, but those platforms refuse to render it. Per-slug cache key, content
// is stable, so we hand back a 1-year immutable cache.
export const config = { runtime: 'edge' };

export const GET: RequestHandler = ({ params }) => {
	const post = getPost(params.slug);
	const title = post?.translations['en']?.title ?? params.slug;
	const coverColor = post?.coverColor ?? '#6d28d9';
	const author = post?.author.name ?? 'Demo Co.';

	return new ImageResponse(
		{
			type: 'div',
			props: {
				style: {
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					padding: '64px',
					background: `linear-gradient(135deg, ${coverColor} 0%, #0c0c14 100%)`,
					color: 'white',
					fontFamily: 'Inter, system-ui, sans-serif'
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								fontSize: 24,
								fontWeight: 600,
								letterSpacing: '0.1em',
								textTransform: 'uppercase',
								opacity: 0.75
							},
							children: 'Demo Co.'
						}
					},
					{
						type: 'div',
						props: {
							style: {
								fontSize: 72,
								fontWeight: 800,
								letterSpacing: '-0.02em',
								lineHeight: 1.1,
								maxWidth: 1000
							},
							children: title
						}
					},
					{
						type: 'div',
						props: {
							style: {
								fontSize: 28,
								fontWeight: 500,
								opacity: 0.85,
								display: 'flex',
								alignItems: 'center',
								gap: 14
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											width: 12,
											height: 12,
											borderRadius: 999,
											background: 'white'
										}
									}
								},
								`By ${author}`
							]
						}
					}
				]
			}
		},
		{
			width: 1200,
			height: 630,
			headers: {
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		}
	);
};
