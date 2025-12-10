import { createServerClient } from "~/lib/client";

export async function action({ request }: { request: Request }) {
	const supabase = createServerClient();
	const method = request.method;

	if (method === "POST") {
		const data = await request.json();
		const { action: authAction } = data;

		// Sign in with Google OAuth
		if (authAction === "google") {
			const { data: authData, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${new URL(request.url).origin}/auth/callback`,
				},
			});

			if (error) {
				return Response.json({ error: error.message }, { status: 400 });
			}

			return Response.json({ url: authData.url });
		}

		// Sign out
		if (authAction === "signout") {
			const { error } = await supabase.auth.signOut();

			if (error) {
				return Response.json({ error: error.message }, { status: 400 });
			}

			// Clear the session cookie
			return new Response(JSON.stringify({ success: true }), {
				headers: {
					"Content-Type": "application/json",
					"Set-Cookie":
						"sb-session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
				},
			});
		}

		return Response.json({ error: "Invalid action" }, { status: 400 });
	}

	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
