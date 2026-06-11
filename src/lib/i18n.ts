export type Lang = "en" | "sv";

export interface Translations {
	appTitle: string;
	appBarTitle: string;
	accessDenied: string;
	accessDeniedMessage: string;
	groupsTitle: string;
	modeGroups: string;
	modeIndividual: string;
	sendToAll: string;
	groupsSelectLabel: string;
	groupsSelectPlaceholder: string;
	groupsLoadError: string;
	individualLabel: string;
	individualPlaceholder: string;
	sendToAllHint: string;
	contentTitle: string;
	contentHint: string;
	localeLabels: Record<string, string>;
	notificationTitle: string;
	notificationBody: string;
	settingsTitle: string;
	categoryLabel: string;
	categoryPlaceholder: string;
	linkLabel: string;
	linkPlaceholder: string;
	importantLabel: string;
	send: string;
	sending: string;
	sent: string;
	sendError: (status: number, detail: string) => string;
	networkError: string;
	sessionExpired: string;
}

const en: Translations = {
	appTitle: "J26 Notification Client",
	appBarTitle: "Send notification",
	accessDenied: "Access denied",
	accessDeniedMessage:
		"You do not have permission to use this service. Contact an administrator if you think this is a mistake.",
	groupsTitle: "Recipients",
	modeGroups: "Groups",
	modeIndividual: "Individual recipients",
	sendToAll: 'Send to all ("@all")',
	groupsSelectLabel: "Select groups",
	groupsSelectPlaceholder: "Search groups…",
	groupsLoadError:
		"Could not load groups. You can still enter recipients manually.",
	individualLabel: "Recipient identifiers",
	individualPlaceholder: "One per line, e.g. scoutnet|3073781",
	sendToAllHint: "The notification will be sent to every registered user.",
	contentTitle: "Content",
	contentHint: "(at least Swedish or English required)",
	localeLabels: { sv: "Swedish", en: "English", nl: "Dutch", uk: "Ukrainian" },
	notificationTitle: "Title",
	notificationBody: "Body",
	settingsTitle: "Settings",
	categoryLabel: "Category (optional)",
	categoryPlaceholder: "e.g. news",
	linkLabel: "Link (optional)",
	linkPlaceholder: "https://app.j26.se/...",
	importantLabel: "Important notification",
	send: "Send notification",
	sending: "Sending…",
	sent: "Sent",
	sendError: (status, detail) => `Send error (${status}): ${detail}`,
	networkError: "Could not reach the API. Check your network connection.",
	sessionExpired:
		"Your session has expired. Please reload the page and log in again.",
};

const sv: Translations = {
	appTitle: "J26 Notissändare",
	appBarTitle: "Skicka notis",
	accessDenied: "Åtkomst nekad",
	accessDeniedMessage:
		"Du har inte behörighet att använda den här tjänsten. Kontakta en administratör om du tror att det är ett misstag.",
	groupsTitle: "Mottagare",
	modeGroups: "Grupper",
	modeIndividual: "Enskilda mottagare",
	sendToAll: 'Skicka till alla ("@all")',
	groupsSelectLabel: "Välj grupper",
	groupsSelectPlaceholder: "Sök grupper…",
	groupsLoadError: "Kunde inte ladda grupper. Du kan ange mottagare manuellt.",
	individualLabel: "Mottagaridentifierare",
	individualPlaceholder: "En per rad, t.ex. scoutnet|3073781",
	sendToAllHint: "Notisen skickas till alla registrerade användare.",
	contentTitle: "Innehåll",
	contentHint: "(minst svenska eller engelska krävs)",
	localeLabels: {
		sv: "Svenska",
		en: "Engelska",
		nl: "Nederländska",
		uk: "Ukrainska",
	},
	notificationTitle: "Rubrik",
	notificationBody: "Brödtext",
	settingsTitle: "Inställningar",
	categoryLabel: "Kategori (valfri)",
	categoryPlaceholder: "t.ex. news",
	linkLabel: "Länk (valfri)",
	linkPlaceholder: "https://app.j26.se/...",
	importantLabel: "Viktig notis",
	send: "Skicka notis",
	sending: "Skickar…",
	sent: "Skickad",
	sendError: (status, detail) => `Fel vid sändning (${status}): ${detail}`,
	networkError: "Kunde inte nå API:et. Kontrollera nätverksanslutningen.",
	sessionExpired: "Din session har gått ut. Ladda om sidan och logga in igen.",
};

export const translations: Record<Lang, Translations> = { en, sv };
