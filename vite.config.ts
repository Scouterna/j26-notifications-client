import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {
	DEFAULT_NOTIFICATIONS_PROXY_PREFIX,
	normalizeBasePath,
	resolveNotificationsUpstream,
	resolveServiceBasePath,
} from "./app.config";

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const basePath = resolveServiceBasePath(env.J26_SERVICE_BASE_PATH, mode);
	const notificationsProxyPrefix = normalizeBasePath(
		env.J26_NOTIFICATIONS_PROXY_PREFIX || DEFAULT_NOTIFICATIONS_PROXY_PREFIX,
	);
	const notificationsUpstream = resolveNotificationsUpstream(
		env.J26_NOTIFICATIONS_UPSTREAM,
		mode,
	);

	return {
		base: basePath,
		plugins: [
			devtools(),
			nitro({
				baseURL: basePath,
				rollupConfig: { external: [/^@sentry\//] },
				routeRules: notificationsUpstream
					? {
							[`${notificationsProxyPrefix}/**`]: {
								proxy: `${notificationsUpstream}/**`,
							},
						}
					: undefined,
				handlers: [
					{
						route: "/app-config",
						handler: "./server/api/app-config.ts",
					},
				],
			}),
			tsconfigPaths({ projects: ["./tsconfig.json"] }),
			tanstackStart({ router: { basepath: basePath } }),
			viteReact({
				babel: {
					plugins: ["babel-plugin-react-compiler"],
				},
			}),
		],
		server: {
			allowedHosts: ["local.j26.se"],
			proxy: notificationsUpstream
				? {
						[notificationsProxyPrefix]: {
							target: notificationsUpstream,
							changeOrigin: true,
						},
					}
				: undefined,
		},
	};
});

export default config;
