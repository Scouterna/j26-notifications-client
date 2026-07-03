import { createServerFn } from "@tanstack/react-start";
import {
	buildTenantGroupsPath,
	buildTenantImportantNotificationsPath,
	buildTenantNotificationsPath,
	DEFAULT_NOTIFICATIONS_PROXY_PREFIX,
	DEFAULT_NOTIFICATIONS_TENANT,
	normalizeBasePath,
	resolveServiceBasePath,
} from "../../app.config";

export interface SenderRuntimeConfig {
	loginPath: string;
	refreshPath: string;
	notificationPostPath: string;
	groupsPath: string;
	importantListPath: string;
	// Prefix + tenant so the per-notification PATCH path can be built with an id
	// at call time via buildTenantNotificationPath().
	notificationsProxyPrefix: string;
	serviceBasePath: string;
	tenant: string;
}

function readRuntimeConfig(): SenderRuntimeConfig {
	const serviceBasePath = resolveServiceBasePath(
		process.env.J26_SERVICE_BASE_PATH,
		process.env.NODE_ENV,
	);
	const notificationsProxyPrefix = normalizeBasePath(
		process.env.J26_NOTIFICATIONS_PROXY_PREFIX ||
			DEFAULT_NOTIFICATIONS_PROXY_PREFIX,
	);
	const tenant =
		process.env.J26_NOTIFICATIONS_TENANT || DEFAULT_NOTIFICATIONS_TENANT;

	return {
		loginPath: "/auth/login",
		refreshPath: "/auth/refresh",
		notificationPostPath: buildTenantNotificationsPath(
			notificationsProxyPrefix,
			tenant,
		),
		groupsPath: buildTenantGroupsPath(notificationsProxyPrefix, tenant),
		importantListPath: buildTenantImportantNotificationsPath(
			notificationsProxyPrefix,
			tenant,
		),
		notificationsProxyPrefix,
		serviceBasePath,
		tenant,
	};
}

export const getSenderRuntimeConfig = createServerFn({ method: "GET" }).handler(
	async (): Promise<SenderRuntimeConfig> => readRuntimeConfig(),
);
