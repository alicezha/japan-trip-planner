import { createServerClient } from "~/lib/client";

export async function loader({ params }: { params: { planId: string } }) {
	const supabase = createServerClient();
	const planId = params.planId;

	if (!planId) {
		return Response.json({ error: "Plan ID is required" }, { status: 400 });
	}

	const { data: items } = await supabase
		.from("PackingItem")
		.select("*")
		.eq("plan_id", planId)
		.order("category", { ascending: true });

	return Response.json(items || []);
}

export async function action({
	request,
	params,
}: {
	request: Request;
	params: { planId: string };
}) {
	const supabase = createServerClient();
	const planId = params.planId;
	const method = request.method;

	if (!planId) {
		return Response.json({ error: "Plan ID is required" }, { status: 400 });
	}

	if (method === "POST") {
		const data = await request.json();
		const { data: item } = await supabase
			.from("PackingItem")
			.insert({
				...data,
				plan_id: planId,
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();
		return Response.json(item, { status: 201 });
	}

	if (method === "PUT") {
		const data = await request.json();
		const { id, ...updateData } = data;

		if (!id) {
			return Response.json({ error: "Item ID is required" }, { status: 400 });
		}

		const { data: item } = await supabase
			.from("PackingItem")
			.update({
				...updateData,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();
		return Response.json(item);
	}

	if (method === "DELETE") {
		const data = await request.json();
		const { id } = data;

		if (!id) {
			return Response.json({ error: "Item ID is required" }, { status: 400 });
		}

		await supabase.from("PackingItem").delete().eq("id", id);
		return Response.json({ success: true });
	}

	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
