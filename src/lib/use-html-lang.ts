import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

function htmlElement(): HTMLElement | null {
	if (typeof window === "undefined") return null;
	return window.parent !== window
		? window.parent.document.documentElement
		: document.documentElement;
}

function normalizeLang(raw: string): Lang {
	const tag = raw.split("-")[0].toLowerCase();
	return tag === "sv" ? "sv" : "en";
}

export function useHtmlLang(): Lang {
	// Always start at the SSR default so the first client render matches the
	// server-rendered HTML (avoids a hydration mismatch). The effect below reads
	// the real <html lang> immediately after mount and updates it.
	const [lang, setLang] = useState<Lang>("en");

	useEffect(() => {
		const el = htmlElement();
		if (!el) return;

		const observer = new MutationObserver(() => {
			setLang(normalizeLang(el.lang));
		});
		observer.observe(el, { attributes: true, attributeFilter: ["lang"] });

		// Sync in case the attribute changed between render and effect
		setLang(normalizeLang(el.lang));

		return () => observer.disconnect();
	}, []);

	return lang;
}
