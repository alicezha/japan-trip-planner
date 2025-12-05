import { prisma } from "~/lib/db.server";

export async function loader({ params }: { params: { planId: string } }) {
	const planId = params.planId;

	if (!planId) {
		return Response.json({ error: "Plan ID is required" }, { status: 400 });
	}

	const items = await prisma.itineraryItem.findMany({
		where: { planId },
		orderBy: { date: "asc" },
	});

	return Response.json(items);
}

export async function action({ request, params }: { request: Request; params: { planId: string } }) {
	const planId = params.planId;
	const method = request.method;

	if (!planId) {
		return Response.json({ error: "Plan ID is required" }, { status: 400 });
	}

	if (method === "POST") {
		const data = await request.json();
		const item = await prisma.itineraryItem.create({
			data: {
				...data,
				planId,
				date: new Date(data.date),
			},
		});
		return Response.json(item, { status: 201 });
	}

	if (method === "PUT") {
		const data = await request.json();
		const { id, ...updateData } = data;

		if (!id) {
			return Response.json({ error: "Item ID is required" }, { status: 400 });
		}

		const item = await prisma.itineraryItem.update({
			where: { id },
			data: {
				...updateData,
				...(updateData.date && { date: new Date(updateData.date) }),
			},
		});
		return Response.json(item);
	}

	if (method === "DELETE") {
		const data = await request.json();
		const { id } = data;

		if (!id) {
			return Response.json({ error: "Item ID is required" }, { status: 400 });
		}

		await prisma.itineraryItem.delete({
			where: { id },
		});
		return Response.json({ success: true });
	}

	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
