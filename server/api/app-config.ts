import { defineEventHandler, getCookie, setResponseStatus } from "h3";
import { decodeAndGetUser } from "../../src/lib/auth.js";
import { resolveServiceBasePath } from "../../app.config.js";

const APP_CONFIG = {
	navigation: [
		{
			type: "page",
			id: "page_notification_sender",
			label: "Skicka notis",
			icon: "bell",
			path: resolveServiceBasePath(
				process.env.J26_SERVICE_BASE_PATH,
				process.env.NODE_ENV,
			),
		},
	],
};

export default defineEventHandler((event) => {
	const token = getCookie(event, "j26-auth_access-token");

	if (!token) {
		setResponseStatus(event, 401);
		return "Unauthorized";
	}

	const user = decodeAndGetUser(token);

	if (!user?.roles.includes("notification-sender")) {
		setResponseStatus(event, 401);
		return "Unauthorized";
	}

	return APP_CONFIG;
});
