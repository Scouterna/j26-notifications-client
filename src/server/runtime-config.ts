import { createServerFn } from "@tanstack/react-start";
import {
	buildTenantNotificationsPath,
	DEFAULT_NOTIFICATIONS_PROXY_PREFIX,
	DEFAULT_NOTIFICATIONS_TENANT,
	normalizeBasePath,
	resolveServiceBasePath,
} from "../../app.config";

export interface SenderRuntimeConfig {
	loginPath: string;
	notificationPostPath: string;
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
		notificationPostPath: buildTenantNotificationsPath(
			notificationsProxyPrefix,
			tenant,
		),
		serviceBasePath,
		tenant,
	};
}

export const getSenderRuntimeConfig = createServerFn({ method: "GET" }).handler(
	async (): Promise<SenderRuntimeConfig> => readRuntimeConfig(),
);
