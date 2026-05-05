import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LangContext } from "../lib/lang-context";
import { theme } from "../theme";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "J26 Notification Sender",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	notFoundComponent: RootNotFound,
	shellComponent: RootDocument,
});

function RootNotFound() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				minHeight="100vh"
				px={3}
				textAlign="center"
				gap={1}
			>
				<Typography variant="h4" component="h1">
					Not Found
				</Typography>
				<Typography variant="body1" color="text.secondary">
					The requested page could not be found.
				</Typography>
			</Box>
		</ThemeProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="sv" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				{/* TODO: read language preference from app shell (j26:setLanguage postMessage) */}
				<LangContext.Provider value="en">
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{children}
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
							]}
						/>
						<Scripts />
					</ThemeProvider>
				</LangContext.Provider>
			</body>
		</html>
	);
}
