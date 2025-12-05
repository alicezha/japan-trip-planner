import { prisma } from "~/lib/db.server";
import type { Route } from "./+types/api.plans";

export async function loader() {
	const plans = await prisma.plan.findMany({
		orderBy: { createdAt: "desc" },
	});

	return Response.json(plans);
}

export async function action({ request }: Route.ActionArgs) {
	const method = request.method;

	if (method === "POST") {
		const plan = await prisma.plan.create({
			data: {},
		});
		return Response.json(plan, { status: 201 });
	}

	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
