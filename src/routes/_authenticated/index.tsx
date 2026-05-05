import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	FormControlLabel,
	IconButton,
	Paper,
	Stack,
	Switch,
	Tab,
	Tabs,
	TextField,
	Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
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

function NotificationSenderPage() {
	const t = useT();
	useAppBarTitle(t.appBarTitle);
	const senderConfig = Route.useLoaderData();

	interface Channel {
		id: number;
		value: string;
	}
	const nextId = useRef(1);
	const [channels, setChannels] = useState<Channel[]>([{ id: 0, value: "" }]);
	const [sendToAll, setSendToAll] = useState(false);
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

	function addChannel() {
		setChannels((prev) => [...prev, { id: nextId.current++, value: "" }]);
	}

	function removeChannel(id: number) {
		setChannels((prev) => prev.filter((ch) => ch.id !== id));
	}

	function updateChannel(id: number, value: string) {
		setChannels((prev) =>
			prev.map((ch) => (ch.id === id ? { ...ch, value } : ch)),
		);
	}

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
			sendToAll || channels.some((c) => c.value.trim().length > 0);
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

		const payload: {
			channels: string[];
			notification: Record<string, { title: string; body: string }>;
			important: boolean;
			category?: string;
			link?: string;
		} = {
			channels: sendToAll
				? ["@all"]
				: channels
						.filter((c) => c.value.trim().length > 0)
						.map((c) => c.value.trim()),
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

			{/* Channels */}
			<Paper variant="outlined" sx={{ p: 2 }}>
				<Typography variant="subtitle1" fontWeight="medium" gutterBottom>
					{t.channelsTitle}
				</Typography>
				<FormControlLabel
					control={
						<Switch
							checked={sendToAll}
							onChange={(e) => setSendToAll(e.target.checked)}
							disabled={disabled}
						/>
					}
					label={t.sendToAll}
				/>
				{!sendToAll && (
					<Stack spacing={1} mt={1}>
						{channels.map((ch, i) => (
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
								key={ch.id}
							>
								<TextField
									label={t.channelLabel(i + 1)}
									value={ch.value}
									onChange={(e) => updateChannel(ch.id, e.target.value)}
									fullWidth
									size="small"
									disabled={disabled}
									placeholder={t.channelPlaceholder}
									InputLabelProps={{ shrink: true }}
								/>
								<IconButton
									onClick={() => removeChannel(ch.id)}
									disabled={disabled || channels.length === 1}
									size="small"
									aria-label={t.removeChannel}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Stack>
						))}
						<Box>
							<Button
								startIcon={<AddIcon />}
								onClick={addChannel}
								size="small"
								disabled={disabled}
							>
								{t.addChannel}
							</Button>
						</Box>
					</Stack>
				)}
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
