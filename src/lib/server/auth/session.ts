import type { SessionUser } from '$lib/schemas/user.js';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

const COOKIE_NAME = 'session';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionPayload {
	user: SessionUser;
	exp: number;
}

async function getKey(): Promise<CryptoKey> {
	const secret = env.SESSION_SECRET ?? 'dev-secret-change-me';
	const raw = new TextEncoder().encode(secret);
	return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
		'verify'
	]);
}

async function sign(payload: string): Promise<string> {
	const key = await getKey();
	const data = new TextEncoder().encode(payload);
	const sig = await crypto.subtle.sign('HMAC', key, data);
	// base64url (no padding issues in cookie values)
	return btoa(String.fromCharCode(...new Uint8Array(sig)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

async function verify(payload: string, signature: string): Promise<boolean> {
	try {
		const key = await getKey();
		const data = new TextEncoder().encode(payload);
		// Re-pad base64url back to standard base64
		const padded = signature.replace(/-/g, '+').replace(/_/g, '/');
		const padLength = (4 - (padded.length % 4)) % 4;
		const padded2 = padded + '='.repeat(padLength);
		const sig = Uint8Array.from(atob(padded2), (c) => c.charCodeAt(0));
		return crypto.subtle.verify('HMAC', key, sig, data);
	} catch {
		return false;
	}
}

export async function createSessionToken(user: SessionUser): Promise<string> {
	const payload: SessionPayload = { user, exp: Date.now() + TTL_MS };
	const encoded = btoa(JSON.stringify(payload)).replace(/=+$/, '');
	const sig = await sign(encoded);
	return `${encoded}.${sig}`;
}

export function setSessionCookie(cookies: Cookies, token: string, secure: boolean) {
	cookies.set(COOKIE_NAME, token, {
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: '/',
		maxAge: TTL_MS / 1000
	});
}

export function deleteSessionCookie(cookies: Cookies) {
	cookies.delete(COOKIE_NAME, { path: '/' });
}

export async function readSession(cookies: Cookies): Promise<SessionUser | null> {
	const token = cookies.get(COOKIE_NAME);
	if (!token) return null;

	const dotIdx = token.lastIndexOf('.');
	if (dotIdx === -1) return null;

	const encoded = token.slice(0, dotIdx);
	const sig = token.slice(dotIdx + 1);

	const valid = await verify(encoded, sig);
	if (!valid) return null;

	try {
		// Re-pad base64 if needed
		const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4);
		const payload: SessionPayload = JSON.parse(atob(padded));
		if (payload.exp < Date.now()) return null;
		return payload.user;
	} catch {
		return null;
	}
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
