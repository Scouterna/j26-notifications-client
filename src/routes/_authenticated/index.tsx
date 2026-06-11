import SendIcon from "@mui/icons-material/Send";
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	CircularProgress,
	FormControlLabel,
	Paper,
	Radio,
	RadioGroup,
	Stack,
	Switch,
	Tab,
	Tabs,
	TextField,
	Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useT } from "#/lib/lang-context";
import { useAppBarTitle } from "#/lib/use-app-bar-title";
import { getSenderRuntimeConfig } from "#/server/runtime-config";

type Locale = "sv" | "en" | "nl" | "uk";

interface LocaleContent {
	title: string;
	body: string;
}

const LOCALES: Locale[] = ["sv", "en", "nl", "uk"];

const emptyContent = (): LocaleContent => ({ title: "", body: "" });

export const Route = createFileRoute("/_authenticated/")({
	loader: () => getSenderRuntimeConfig(),
	component: NotificationSenderPage,
});

type RecipientMode = "groups" | "individual" | "all";

function topLevelSegment(path: string): string {
	return path.split("/")[1] ?? "";
}

function parseIndividuals(text: string): string[] {
	return text
		.split(/[\n,]/)
		.map((s) => s.trim())
		.filter(Boolean);
}

function NotificationSenderPage() {
	const t = useT();
	useAppBarTitle(t.appBarTitle);
	const senderConfig = Route.useLoaderData();

	const [mode, setMode] = useState<RecipientMode>("groups");
	const [groups, setGroups] = useState<string[]>([]);
	const [groupsLoading, setGroupsLoading] = useState(true);
	const [groupsError, setGroupsError] = useState(false);
	const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
	const [individualText, setIndividualText] = useState("");
	const [content, setContent] = useState<Record<Locale, LocaleContent>>({
		sv: emptyContent(),
		en: emptyContent(),
		nl: emptyContent(),
		uk: emptyContent(),
	});
	const [category, setCategory] = useState("");
	const [link, setLink] = useState("");
	const [important, setImportant] = useState(false);
	const [activeTab, setActiveTab] = useState<Locale>("sv");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function fetchGroups() {
			return fetch(senderConfig.groupsPath, { credentials: "include" });
		}

		(async () => {
			try {
				let res = await fetchGroups();

				if (res.status === 401) {
					await fetch(senderConfig.refreshPath, { credentials: "include" });
					res = await fetchGroups();
				}

				if (!res.ok) throw new Error(`Failed to load groups: ${res.status}`);

				const data: string[] = await res.json();
				// Sort by top-level segment so Autocomplete's groupBy headers stay
				// contiguous, then alphabetically within each group.
				const sorted = [...data].sort((a, b) => {
					const ta = topLevelSegment(a);
					const tb = topLevelSegment(b);
					return ta === tb ? a.localeCompare(b) : ta.localeCompare(tb);
				});

				if (active) {
					setGroups(sorted);
					setGroupsLoading(false);
				}
			} catch {
				if (active) {
					setGroupsError(true);
					setGroupsLoading(false);
					// Don't trap the user if the list can't load.
					setMode("individual");
				}
			}
		})();

		return () => {
			active = false;
		};
	}, [senderConfig.groupsPath, senderConfig.refreshPath]);

	function updateContent(
		locale: Locale,
		field: keyof LocaleContent,
		value: string,
	) {
		setContent((prev) => ({
			...prev,
			[locale]: { ...prev[locale], [field]: value },
		}));
	}

	function isFormValid(): boolean {
		const hasChannels =
			mode === "all" ||
			(mode === "groups" && selectedGroups.length > 0) ||
			(mode === "individual" && parseIndividuals(individualText).length > 0);
		const hasSv =
			content.sv.title.trim().length > 0 && content.sv.body.trim().length > 0;
		const hasEn =
			content.en.title.trim().length > 0 && content.en.body.trim().length > 0;
		return hasChannels && (hasSv || hasEn);
	}

	async function handleSubmit() {
		setSending(true);
		setError(null);

		const notification: Record<string, { title: string; body: string }> = {};
		for (const locale of LOCALES) {
			const c = content[locale];
			if (c.title.trim() && c.body.trim()) {
				notification[locale] = { title: c.title.trim(), body: c.body.trim() };
			}
		}

		let channels: string[];
		if (mode === "all") {
			channels = ["@all"];
		} else if (mode === "groups") {
			channels = selectedGroups;
		} else {
			channels = parseIndividuals(individualText);
		}

		const payload: {
			channels: string[];
			notification: Record<string, { title: string; body: string }>;
			important: boolean;
			category?: string;
			link?: string;
		} = {
			channels,
			notification,
			important,
		};
		if (category.trim()) payload.category = category.trim();
		if (link.trim()) payload.link = link.trim();

		async function postNotification() {
			return fetch(senderConfig.notificationPostPath, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload),
			});
		}

		try {
			let res = await postNotification();

			if (res.status === 401) {
				const refreshRes = await fetch(senderConfig.refreshPath, {
					credentials: "include",
				});

				if (refreshRes.status === 401) {
					setError(t.sessionExpired);
					setSending(false);
					return;
				}

				res = await postNotification();
			}

			if (!res.ok) {
				const text = await res.text().catch(() => res.statusText);
				setError(t.sendError(res.status, text));
				setSending(false);
				return;
			}

			setSending(false);
			setSent(true);
		} catch {
			setError(t.networkError);
			setSending(false);
		}
	}

	const disabled = sending || sent;
	const submitDisabled = sending || (!sent && !isFormValid());

	return (
		<Stack spacing={3}>
			<Typography variant="h5" component="h1" fontWeight="medium">
				{t.send}
			</Typography>

			{error && <Alert severity="error">{error}</Alert>}

			{/* Recipients */}
			<Paper variant="outlined" sx={{ p: 2 }}>
				<Typography variant="subtitle1" fontWeight="medium" gutterBottom>
					{t.groupsTitle}
				</Typography>

				{groupsError && (
					<Alert severity="warning" sx={{ mb: 2 }}>
						{t.groupsLoadError}
					</Alert>
				)}

				<RadioGroup
					row
					value={mode}
					onChange={(e) => setMode(e.target.value as RecipientMode)}
				>
					<FormControlLabel
						value="groups"
						control={<Radio />}
						label={t.modeGroups}
						disabled={disabled || groupsError}
					/>
					<FormControlLabel
						value="individual"
						control={<Radio />}
						label={t.modeIndividual}
						disabled={disabled}
					/>
					<FormControlLabel
						value="all"
						control={<Radio />}
						label={t.sendToAll}
						disabled={disabled}
					/>
				</RadioGroup>

				<Box sx={{ mt: 1 }}>
					{mode === "groups" && (
						<Autocomplete
							multiple
							options={groups}
							value={selectedGroups}
							onChange={(_, value) => setSelectedGroups(value)}
							groupBy={(option) => topLevelSegment(option)}
							loading={groupsLoading}
							disabled={disabled || groupsError}
							renderInput={(params) => (
								<TextField
									{...params}
									label={t.groupsSelectLabel}
									placeholder={t.groupsSelectPlaceholder}
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<>
												{groupsLoading ? (
													<CircularProgress color="inherit" size={20} />
												) : null}
												{params.InputProps.endAdornment}
											</>
										),
									}}
								/>
							)}
						/>
					)}

					{mode === "individual" && (
						<TextField
							label={t.individualLabel}
							value={individualText}
							onChange={(e) => setIndividualText(e.target.value)}
							fullWidth
							multiline
							rows={3}
							disabled={disabled}
							placeholder={t.individualPlaceholder}
							InputLabelProps={{ shrink: true }}
						/>
					)}

					{mode === "all" && (
						<Typography variant="body2" color="text.secondary">
							{t.sendToAllHint}
						</Typography>
					)}
				</Box>
			</Paper>

			{/* Content per language */}
			<Paper variant="outlined" sx={{ p: 2 }}>
				<Typography variant="subtitle1" fontWeight="medium" gutterBottom>
					{t.contentTitle}{" "}
					<Typography component="span" variant="caption" color="text.secondary">
						{t.contentHint}
					</Typography>
				</Typography>
				<Tabs
					value={activeTab}
					onChange={(_, v: Locale) => setActiveTab(v)}
					variant="scrollable"
					scrollButtons="auto"
				>
					{LOCALES.map((locale) => {
						const c = content[locale];
						const filled = c.title.trim() && c.body.trim();
						const required = locale === "sv" || locale === "en";
						return (
							<Tab
								key={locale}
								label={
									<Box component="span">
										{t.localeLabels[locale]}
										{filled ? (
											<Box
												component="span"
												sx={{
													ml: 0.5,
													color: "success.main",
													fontWeight: "bold",
												}}
											>
												✓
											</Box>
										) : required ? (
											<Box
												component="span"
												sx={{ ml: 0.5, color: "text.disabled" }}
											>
												*
											</Box>
										) : null}
									</Box>
								}
								value={locale}
							/>
						);
					})}
				</Tabs>
				{LOCALES.map((locale) => (
					<Box
						key={locale}
						hidden={activeTab !== locale}
						sx={{ mt: 2 }}
						role="tabpanel"
					>
						<Stack spacing={2}>
							<TextField
								label={t.notificationTitle}
								value={content[locale].title}
								onChange={(e) => updateContent(locale, "title", e.target.value)}
								fullWidth
								disabled={disabled}
							/>
							<TextField
								label={t.notificationBody}
								value={content[locale].body}
								onChange={(e) => updateContent(locale, "body", e.target.value)}
								fullWidth
								multiline
								rows={3}
								disabled={disabled}
							/>
						</Stack>
					</Box>
				))}
			</Paper>

			{/* Optional settings */}
			<Paper variant="outlined" sx={{ p: 2 }}>
				<Typography variant="subtitle1" fontWeight="medium" gutterBottom>
					{t.settingsTitle}
				</Typography>
				<Stack spacing={2}>
					<TextField
						label={t.categoryLabel}
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						fullWidth
						disabled={disabled}
						placeholder={t.categoryPlaceholder}
						InputLabelProps={{ shrink: true }}
					/>
					<TextField
						label={t.linkLabel}
						value={link}
						onChange={(e) => setLink(e.target.value)}
						fullWidth
						disabled={disabled}
						type="url"
						placeholder={t.linkPlaceholder}
						InputLabelProps={{ shrink: true }}
					/>
					<FormControlLabel
						control={
							<Switch
								checked={important}
								onChange={(e) => setImportant(e.target.checked)}
								disabled={disabled}
							/>
						}
						label={t.importantLabel}
					/>
				</Stack>
			</Paper>

			{/* Send button */}
			<Button
				variant="contained"
				size="large"
				fullWidth
				onClick={sent ? () => window.location.reload() : handleSubmit}
				disabled={submitDisabled}
				startIcon={
					sending ? (
						<CircularProgress size={20} color="inherit" />
					) : (
						<SendIcon />
					)
				}
			>
				{sending ? t.sending : sent ? t.sent : t.send}
			</Button>
		</Stack>
	);
}
