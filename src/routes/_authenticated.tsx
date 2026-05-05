import { Box, Container, Typography } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useT } from "#/lib/lang-context";
import { UserContext } from "#/lib/user-context";
import { getUserStatus } from "#/server/auth";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const { user, tokenPresent } = await getUserStatus();
		// Token present but decode failed → deny
		if (tokenPresent && !user) throw new Error("unauthorized");
		// Valid token but missing required role → deny
		if (user && !user.roles.includes("notification-sender"))
			throw new Error("unauthorized");
		return { user };
	},
	errorComponent: Unauthorized,
	component: AuthenticatedLayout,
});

function Unauthorized() {
	const t = useT();
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			minHeight="100vh"
			gap={2}
		>
			<Typography variant="h4" component="h1">
				{t.accessDenied}
			</Typography>
			<Typography variant="body1" color="text.secondary">
				{t.accessDeniedMessage}
			</Typography>
		</Box>
	);
}

function AuthenticatedLayout() {
	const { user } = Route.useRouteContext();

	return (
		<UserContext.Provider value={user}>
			<Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
				<Outlet />
			</Container>
		</UserContext.Provider>
	);
}
