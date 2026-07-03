import {
	Alert,
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	List,
	ListItem,
	Paper,
	Stack,
	Toolbar,
	Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Lang } from "#/lib/i18n";
import { useLang, useT } from "#/lib/lang-context";
import { useAppBarTitle } from "#/lib/use-app-bar-title";
import { getSenderRuntimeConfig } from "#/server/runtime-config";
import { buildTenantNotificationPath } from "../../../app.config";

interface NotificationTranslation {
	title: string;
	body: string;
}

interface ImportantNotification {
	id: number;
	notification: Record<string, NotificationTranslation>;
	important: boolean;
	sent_at: string;
	channels: string[];
}

export const Route = createFileRoute("/_authenticated/important")({
	loader: () => getSenderRuntimeConfig(),
	component: ImportantNotificationsPage,
});

// Prefer the viewer's UI language for the row's title/body, then fall back to
// the locales the sender is required to fill (sv, en), then anything present.
function pickTranslation(
	notification: Record<string, NotificationTranslation>,
	lang: Lang,
): NotificationTranslation | null {
	const order = [lang, "sv", "en"];
	for (const key of order) {
		if (notification[key]) return notification[key];
	}
	const first = Object.values(notification)[0];
	return first ?? null;
}

function formatSentAt(iso: string, lang: Lang): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString(lang === "sv" ? "sv-SE" : "en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

function displayTitle(
	notification: Record<string, NotificationTranslation>,
	lang: Lang,
	fallback: string,
): string {
	return pickTranslation(notification, lang)?.title.trim() || fallback;
}

function ImportantNotificationsPage() {
	const t = useT();
	const lang = useLang();
	useAppBarTitle(t.importantListTitle);
	const config = Route.useLoaderData();

	const [items, setItems] = useState<ImportantNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [confirmOpen, setConfirmOpen] = useState(false);
	// True while the confirmed batch PATCH loop is running.
	const [clearing, setClearing] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function fetchList() {
			return fetch(config.importantListPath, { credentials: "include" });
		}

		(async () => {
			try {
				let res = await fetchList();

				if (res.status === 401) {
					await fetch(config.refreshPath, { credentials: "include" });
					res = await fetchList();
				}

				if (!res.ok) throw new Error(`Failed to load: ${res.status}`);

				const data: ImportantNotification[] = await res.json();
				if (active) {
					setItems(data);
					setLoading(false);
				}
			} catch {
				if (active) {
					setLoadError(true);
					setLoading(false);
				}
			}
		})();

		return () => {
			active = false;
		};
	}, [config.importantListPath, config.refreshPath]);

	function toggleSelected(id: number) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}

	// Clear one notification's important flag. Resolves true on success so the
	// batch loop can decide which rows to drop and which to keep on failure.
	async function clearOne(id: number): Promise<boolean> {
		const path = buildTenantNotificationPath(
			config.notificationsProxyPrefix,
			config.tenant,
			id,
		);

		async function patch() {
			return fetch(path, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ important: false }),
			});
		}

		try {
			let res = await patch();
			if (res.status === 401) {
				await fetch(config.refreshPath, { credentials: "include" });
				res = await patch();
			}
			return res.ok;
		} catch {
			return false;
		}
	}

	async function handleConfirmClear() {
		setClearing(true);
		setActionError(null);

		const ids = [...selected];
		const failedIds: number[] = [];

		for (const id of ids) {
			const ok = await clearOne(id);
			if (ok) {
				// Drop succeeded rows as we go; the list only shows still-important ones.
				setItems((prev) => prev.filter((n) => n.id !== id));
			} else {
				failedIds.push(id);
			}
		}

		// Keep only failures selected so the user can retry them directly.
		setSelected(new Set(failedIds));
		setClearing(false);
		setConfirmOpen(false);
		if (failedIds.length > 0) {
			setActionError(t.clearBatchError(failedIds.length));
		}
	}

	const selectedItems = items.filter((n) => selected.has(n.id));
	const selectedCount = selectedItems.length;

	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h5" component="h1" fontWeight="medium">
					{t.importantListTitle}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{t.importantListHint}
				</Typography>
			</Box>

			{actionError && <Alert severity="error">{actionError}</Alert>}

			{loadError && <Alert severity="error">{t.importantListError}</Alert>}

			{loading ? (
				<Box display="flex" justifyContent="center" py={4}>
					<CircularProgress />
				</Box>
			) : !loadError && items.length === 0 ? (
				<Paper variant="outlined" sx={{ p: 3 }}>
					<Typography color="text.secondary" textAlign="center">
						{t.importantListEmpty}
					</Typography>
				</Paper>
			) : (
				<Paper variant="outlined">
					<Toolbar
						variant="dense"
						sx={{
							justifyContent: "flex-end",
							borderBottom: 1,
							borderColor: "divider",
							gap: 2,
						}}
					>
						<Button
							variant="contained"
							color="warning"
							size="small"
							disabled={selectedCount === 0}
							onClick={() => setConfirmOpen(true)}
						>
							{t.clearImportantCount(selectedCount)}
						</Button>
					</Toolbar>
					<List disablePadding>
						{items.map((item, index) => {
							const tr = pickTranslation(item.notification, lang);
							const title = tr?.title.trim() || t.untitledNotification;
							const isSelected = selected.has(item.id);
							return (
								<Box key={item.id}>
									{index > 0 && <Divider component="li" />}
									<ListItem sx={{ alignItems: "flex-start", gap: 1, py: 1.5 }}>
										<Checkbox
											edge="start"
											checked={isSelected}
											onChange={() => toggleSelected(item.id)}
											disabled={clearing}
											inputProps={{ "aria-label": title }}
											sx={{ mt: -0.5 }}
										/>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography fontWeight="medium">{title}</Typography>
											{tr?.body && (
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient: "vertical",
														overflow: "hidden",
													}}
												>
													{tr.body}
												</Typography>
											)}
											<Stack
												direction="row"
												spacing={1}
												alignItems="center"
												sx={{ mt: 0.5, flexWrap: "wrap" }}
											>
												<Typography variant="caption" color="text.secondary">
													{t.sentAtLabel(formatSentAt(item.sent_at, lang))}
												</Typography>
												{item.channels.map((ch) => (
													<Chip
														key={ch}
														size="small"
														variant="outlined"
														label={ch === "@all" ? t.channelsAll : ch}
													/>
												))}
											</Stack>
										</Box>
									</ListItem>
								</Box>
							);
						})}
					</List>
				</Paper>
			)}

			<Dialog
				open={confirmOpen}
				onClose={() => !clearing && setConfirmOpen(false)}
			>
				<DialogTitle>{t.confirmClearTitle}</DialogTitle>
				<DialogContent>
					<DialogContentText component="div">
						{t.confirmClearIntro(selectedCount)}
						<Box component="ul" sx={{ mt: 1, mb: 1, pl: 3 }}>
							{selectedItems.map((item) => (
								<li key={item.id}>
									{displayTitle(
										item.notification,
										lang,
										t.untitledNotification,
									)}
								</li>
							))}
						</Box>
						{t.confirmClearIrreversible}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)} disabled={clearing}>
						{t.confirmClearCancel}
					</Button>
					<Button
						variant="contained"
						color="warning"
						onClick={handleConfirmClear}
						disabled={clearing}
						startIcon={
							clearing ? (
								<CircularProgress size={16} color="inherit" />
							) : undefined
						}
					>
						{clearing ? t.clearing : t.confirmClearConfirm}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
