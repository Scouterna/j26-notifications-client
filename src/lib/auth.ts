import { decodeJwt } from "jose";

interface KeycloakPayload {
	sub?: string;
	resource_access?: {
		"j26-notifications"?: {
			roles: string[];
		};
	};
	name?: string;
	preferred_username?: string;
	email?: string;
	picture?: string;
}

export interface AppUser {
	sub: string;
	name: string;
	email: string;
	preferredUsername: string;
	picture?: string;
	roles: string[];
}

export function decodeAndGetUser(token: string): AppUser | null {
	try {
		const payload = decodeJwt(token) as KeycloakPayload;
		if (!payload.sub) return null;
		return {
			sub: payload.sub,
			name: payload.name ?? "Okänd",
			email: payload.email ?? "",
			preferredUsername: payload.preferred_username ?? "",
			picture: payload.picture,
			roles: payload.resource_access?.["j26-notifications"]?.roles ?? [],
		};
	} catch (err) {
		console.error("[auth] decodeAndGetUser failed:", err);
		return null;
	}
}
