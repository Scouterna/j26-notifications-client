export type Lang = "en" | "sv";

export interface Translations {
	appTitle: string;
	appBarTitle: string;
	accessDenied: string;
	accessDeniedMessage: string;
	channelsTitle: string;
	sendToAll: string;
	channelLabel: (n: number) => string;
	channelPlaceholder: string;
	removeChannel: string;
	addChannel: string;
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
}

const en: Translations = {
	appTitle: "J26 Notification Sender",
	appBarTitle: "Send notification",
	accessDenied: "Access denied",
	accessDeniedMessage:
		"You do not have permission to use this service. Contact an administrator if you think this is a mistake.",
	channelsTitle: "Channels",
	sendToAll: 'Send to all ("@all")',
	channelLabel: (n) => `Channel ${n}`,
	channelPlaceholder: "e.g. /scoutnet/784 or scoutnet|3073781",
	removeChannel: "Remove channel",
	addChannel: "Add channel",
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
};

const sv: Translations = {
	appTitle: "J26 Notissändare",
	appBarTitle: "Skicka notis",
	accessDenied: "Åtkomst nekad",
	accessDeniedMessage:
		"Du har inte behörighet att använda den här tjänsten. Kontakta en administratör om du tror att det är ett misstag.",
	channelsTitle: "Kanaler",
	sendToAll: 'Skicka till alla ("@all")',
	channelLabel: (n) => `Kanal ${n}`,
	channelPlaceholder: "t.ex. /scoutnet/784 eller scoutnet|3073781",
	removeChannel: "Ta bort kanal",
	addChannel: "Lägg till kanal",
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
};

export const translations: Record<Lang, Translations> = { en, sv };
