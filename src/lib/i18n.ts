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
	// Tabs
	tabSend: string;
	tabImportant: string;
	// Important-notifications list
	importantListTitle: string;
	importantListHint: string;
	importantListEmpty: string;
	importantListError: string;
	clearImportant: string;
	clearImportantCount: (count: number) => string;
	clearing: string;
	clearImportantError: (status: number, detail: string) => string;
	clearBatchError: (failed: number) => string;
	untitledNotification: string;
	sentAtLabel: (when: string) => string;
	channelsAll: string;
	// Confirm dialog
	confirmClearTitle: string;
	confirmClearIntro: (count: number) => string;
	confirmClearIrreversible: string;
	confirmClearConfirm: string;
	confirmClearCancel: string;
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
	individualLabel: "Member numbers",
	individualPlaceholder: "One per line, e.g. 3073781",
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
	tabSend: "Send",
	tabImportant: "Important",
	importantListTitle: "Important notifications",
	importantListHint:
		"These stay pinned to the top in the app. Clear the flag when a notification is no longer important.",
	importantListEmpty: "No notifications are currently marked important.",
	importantListError: "Could not load important notifications.",
	clearImportant: "Clear important",
	clearImportantCount: (count) => `Clear important (${count})`,
	clearing: "Clearing…",
	clearImportantError: (status, detail) =>
		`Could not clear (${status}): ${detail}`,
	clearBatchError: (failed) =>
		failed === 1
			? "1 notification could not be cleared and is still listed."
			: `${failed} notifications could not be cleared and are still listed.`,
	untitledNotification: "(no title)",
	sentAtLabel: (when) => `Sent ${when}`,
	channelsAll: "All users",
	confirmClearTitle: "Clear important flag?",
	confirmClearIntro: (count) =>
		count === 1
			? "This notification will no longer be shown first:"
			: `These ${count} notifications will no longer be shown first:`,
	confirmClearIrreversible:
		"This cannot be undone from here — you would have to send a new notification.",
	confirmClearConfirm: "Clear important",
	confirmClearCancel: "Cancel",
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
	individualLabel: "Medlemsnummer",
	individualPlaceholder: "Ett per rad, t.ex. 3073781",
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
	tabSend: "Skicka",
	tabImportant: "Viktiga",
	importantListTitle: "Viktiga notiser",
	importantListHint:
		"Dessa visas överst i appen. Ta bort markeringen när en notis inte längre är viktig.",
	importantListEmpty: "Inga notiser är markerade som viktiga just nu.",
	importantListError: "Kunde inte ladda viktiga notiser.",
	clearImportant: "Ta bort viktig",
	clearImportantCount: (count) => `Ta bort viktig (${count})`,
	clearing: "Tar bort…",
	clearImportantError: (status, detail) =>
		`Kunde inte ta bort (${status}): ${detail}`,
	clearBatchError: (failed) =>
		failed === 1
			? "1 notis kunde inte tas bort och visas fortfarande."
			: `${failed} notiser kunde inte tas bort och visas fortfarande.`,
	untitledNotification: "(ingen rubrik)",
	sentAtLabel: (when) => `Skickad ${when}`,
	channelsAll: "Alla användare",
	confirmClearTitle: "Ta bort viktig-markering?",
	confirmClearIntro: (count) =>
		count === 1
			? "Den här notisen visas inte längre först:"
			: `Dessa ${count} notiser visas inte längre först:`,
	confirmClearIrreversible:
		"Detta kan inte ångras härifrån — du får skicka en ny notis.",
	confirmClearConfirm: "Ta bort viktig",
	confirmClearCancel: "Avbryt",
};

export const translations: Record<Lang, Translations> = { en, sv };
