import { Calendar, DollarSign, Download, Package, Plane } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { BudgetList } from "~/components/features/budget-list";
import { ItineraryList } from "~/components/features/itinerary-list";
import { PackingList } from "~/components/features/packing-list";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { prisma } from "~/lib/db.server";
import { exportToCSV } from "~/lib/export";

export async function loader() {
	// Get or create a default plan
	let plan = await prisma.plan.findFirst({
		orderBy: { createdAt: "desc" },
	});

	if (!plan) {
		plan = await prisma.plan.create({ data: {} });
	}

	const [itineraryItems, budgetItems, packingItems] = await Promise.all([
		prisma.itineraryItem.findMany({
			where: { planId: plan.id },
			orderBy: { date: "asc" },
		}),
		prisma.budgetItem.findMany({
			where: { planId: plan.id },
			orderBy: { createdAt: "asc" },
		}),
		prisma.packingItem.findMany({
			where: { planId: plan.id },
			orderBy: { category: "asc" },
		}),
	]);

	return {
		plan,
		itineraryItems,
		budgetItems,
		packingItems,
	};
}

type Tab = "itinerary" | "budget" | "packing";

const Home = () => {
	const { plan, itineraryItems, budgetItems, packingItems } =
		useLoaderData<typeof loader>();
	const [activeTab, setActiveTab] = useState<Tab>("itinerary");

	const handleExport = () => {
		if (activeTab === "itinerary") {
			exportToCSV(
				itineraryItems as unknown as Record<string, unknown>[],
				"itinerary.csv",
				["date", "city", "activity", "description"],
			);
		} else if (activeTab === "budget") {
			exportToCSV(
				budgetItems as unknown as Record<string, unknown>[],
				"budget.csv",
				["category", "item", "estimated", "actual", "paid"],
			);
		} else if (activeTab === "packing") {
			exportToCSV(
				packingItems as unknown as Record<string, unknown>[],
				"packing.csv",
				["item", "category", "packed"],
			);
		}
	};

	const tabs = [
		{ id: "itinerary" as const, label: "Itinerary", icon: Calendar },
		{ id: "budget" as const, label: "Budget", icon: DollarSign },
		{ id: "packing" as const, label: "Packing List", icon: Package },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
			<div className="max-w-7xl mx-auto p-6">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<Plane className="w-10 h-10 text-red-600" />
						<h1 className="text-4xl font-bold text-gray-900">
							Japan Trip Planner
						</h1>
					</div>
					<p className="text-gray-600 ml-13">
						Plan your perfect journey to the Land of the Rising Sun
					</p>
				</div>

				{/* Tabs */}
				<Card className="mb-6">
					<CardHeader className="pb-0">
						<div className="flex items-center justify-between">
							<div className="flex gap-1 border-b border-gray-200 w-full">
								{tabs.map((tab) => (
									<button
										type="button"
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
											activeTab === tab.id
												? "border-red-500 text-red-600"
												: "border-transparent text-gray-600 hover:text-red-500"
										}`}
									>
										<tab.icon className="w-4 h-4" />
										{tab.label}
									</button>
								))}
							</div>
							<Button onClick={handleExport} variant="secondary" size="sm">
								<Download className="w-4 h-4" />
								Export CSV
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						{activeTab === "itinerary" && (
							<ItineraryList items={itineraryItems} planId={plan.id} />
						)}
						{activeTab === "budget" && (
							<BudgetList items={budgetItems} planId={plan.id} />
						)}
						{activeTab === "packing" && (
							<PackingList items={packingItems} planId={plan.id} />
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
export default Home;
