import type { SessionUser } from '$lib/schemas/user.js';
import { env } from '$env/dynamic/private';

const COOKIE = 'session';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionPayload {
	user: SessionUser;
	exp: number;
}

async function getKey(): Promise<CryptoKey> {
	const secret = env.SESSION_SECRET ?? 'dev-secret-change-me';
	const raw = new TextEncoder().encode(secret);
	return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(payload: string): Promise<string> {
	const key = await getKey();
	const data = new TextEncoder().encode(payload);
	const sig = await crypto.subtle.sign('HMAC', key, data);
	return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verify(payload: string, signature: string): Promise<boolean> {
	try {
		const key = await getKey();
		const data = new TextEncoder().encode(payload);
		const sig = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
		return crypto.subtle.verify('HMAC', key, sig, data);
	} catch {
		return false;
	}
}

export async function createSessionCookie(user: SessionUser): Promise<string> {
	const payload: SessionPayload = { user, exp: Date.now() + TTL_MS };
	const encoded = btoa(JSON.stringify(payload));
	const sig = await sign(encoded);
	return `${COOKIE}=${encoded}.${encodeURIComponent(sig)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${TTL_MS / 1000}`;
}

export async function readSession(cookieHeader: string | null): Promise<SessionUser | null> {
	if (!cookieHeader) return null;
	const match = cookieHeader.match(/session=([^;]+)/);
	if (!match) return null;

	const [encoded, rawSig] = match[1].split('.');
	if (!encoded || !rawSig) return null;

	const sig = decodeURIComponent(rawSig);
	const valid = await verify(encoded, sig);
	if (!valid) return null;

	try {
		const payload: SessionPayload = JSON.parse(atob(encoded));
		if (payload.exp < Date.now()) return null;
		return payload.user;
	} catch {
		return null;
	}
}

export const SESSION_COOKIE_NAME = COOKIE;
