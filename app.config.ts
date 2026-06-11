export const DEFAULT_LOCAL_SERVICE_BASE_PATH = "/";
export const DEFAULT_DEPLOYED_SERVICE_BASE_PATH =
	"/_services/notification-client";
export const DEFAULT_NOTIFICATIONS_PROXY_PREFIX = "/notifications";
export const DEFAULT_NOTIFICATIONS_TENANT = "jamboree26";
export const DEFAULT_LOCAL_NOTIFICATIONS_UPSTREAM = "http://localhost:8000";

export function ensureLeadingSlash(value: string): string {
	return value.startsWith("/") ? value : `/${value}`;
}

export function trimTrailingSlash(value: string): string {
	return value.replace(/\/+$/, "") || "/";
}

export function normalizeBasePath(value: string): string {
	if (!value || value === "/") {
		return "/";
	}

	return trimTrailingSlash(ensureLeadingSlash(value));
}

export function resolveServiceBasePath(
	configuredValue?: string | null,
	executionMode?: string,
): string {
	const trimmedValue = configuredValue?.trim();

	if (trimmedValue) {
		return normalizeBasePath(trimmedValue);
	}

	return executionMode === "development"
		? DEFAULT_LOCAL_SERVICE_BASE_PATH
		: DEFAULT_DEPLOYED_SERVICE_BASE_PATH;
}

export function resolveNotificationsUpstream(
	configuredValue?: string | null,
	executionMode?: string,
): string | null {
	const trimmedValue = configuredValue?.trim();

	if (trimmedValue) {
		return trimTrailingSlash(trimmedValue);
	}

	return executionMode === "development"
		? DEFAULT_LOCAL_NOTIFICATIONS_UPSTREAM
		: null;
}

export function buildTenantNotificationsPath(
	proxyPrefix: string,
	tenant: string,
): string {
	const normalizedPrefix = normalizeBasePath(proxyPrefix);
	const normalizedTenant = tenant.trim();

	if (!normalizedTenant) {
		throw new Error("Notification tenant is required");
	}

	return `${normalizedPrefix}/api/tenants/${normalizedTenant}/notifications`;
}

export function buildTenantGroupsPath(
	proxyPrefix: string,
	tenant: string,
): string {
	const normalizedPrefix = normalizeBasePath(proxyPrefix);
	const normalizedTenant = tenant.trim();

	if (!normalizedTenant) {
		throw new Error("Notification tenant is required");
	}

	return `${normalizedPrefix}/api/tenants/${normalizedTenant}/groups`;
}