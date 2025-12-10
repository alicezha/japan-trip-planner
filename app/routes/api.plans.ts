import { createServerClient } from "~/lib/client";
import type { Route } from "./+types/api.plans";

export async function loader() {
	const supabase = createServerClient();

	// Get current user
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get user's plans and public plans
	const { data: plans } = await supabase
		.from("Plan")
		.select("*")
		.or(`owner.eq.${session.user.id},visibility.eq.PUBLIC`)
		.order("created_at", { ascending: false });

	return Response.json(plans || []);
}

export async function action({ request }: Route.ActionArgs) {
	const supabase = createServerClient();
	const method = request.method;

	// Get current user
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (method === "POST") {
		const body = await request.json();
		const { visibility = "PRIVATE" } = body;

		const { data: plan } = await supabase
			.from("Plan")
			.insert({
				owner: session.user.id,
				visibility,
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();
		return Response.json(plan, { status: 201 });
	}

	if (method === "PATCH") {
		const body = await request.json();
		const { id, visibility } = body;

		// Verify ownership
		const { data: existingPlan } = await supabase
			.from("Plan")
			.select("owner")
			.eq("id", id)
			.single();

		if (existingPlan?.owner !== session.user.id) {
			return Response.json({ error: "Forbidden" }, { status: 403 });
		}

		const { data: plan } = await supabase
			.from("Plan")
			.update({ visibility, updated_at: new Date().toISOString() })
			.eq("id", id)
			.select()
			.single();

		return Response.json(plan);
	}

	if (method === "DELETE") {
		const body = await request.json();
		const { id } = body;

		// Verify ownership
		const { data: existingPlan } = await supabase
			.from("Plan")
			.select("owner")
			.eq("id", id)
			.single();

		if (existingPlan?.owner !== session.user.id) {
			return Response.json({ error: "Forbidden" }, { status: 403 });
		}

		await supabase.from("Plan").delete().eq("id", id);

		return Response.json({ success: true });
	}

	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
