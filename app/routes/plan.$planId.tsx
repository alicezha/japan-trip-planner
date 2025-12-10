import {
	Calendar,
	DollarSign,
	Link2,
	Package,
	Play,
	Plane,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { BudgetList } from "~/components/features/budget-list";
import { ItineraryList } from "~/components/features/itinerary-list";
import { PackingList } from "~/components/features/packing-list";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { supabase } from "~/lib/client";
import type { Tables } from "~/lib/types/supabase";

export function meta() {
	return [
		{ title: "Trip Planner - Public Viewing" },
		{
			name: "description",
			content: "Plan your perfect journey",
		},
	];
}

export async function loader({ params }: LoaderFunctionArgs) {
	const { planId } = params;
	if (!planId) {
		throw new Response("Not Found", { status: 404 });
	}

	// Check if plan exists and is public
	const { data: plan } = await supabase
		.from("Plan")
		.select("*")
		.eq("id", planId)
		.single();

	if (!plan || plan.visibility !== "PUBLIC") {
		throw new Response("Not Found", { status: 404 });
	}

	return { planId, plan };
}

type Tab = "itinerary" | "budget" | "packing";

export default function PublicPlan() {
	const { planId, plan } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<Tab>("itinerary");
	const [itineraryItems, setItineraryItems] = useState<
		Tables<"ItineraryItem">[]
	>([]);
	const [budgetItems, setBudgetItems] = useState<Tables<"BudgetItem">[]>([]);
	const [packingItems, setPackingItems] = useState<Tables<"PackingItem">[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			supabase
				.from("ItineraryItem")
				.select("*")
				.eq("plan_id", planId)
				.order("created_at", { ascending: true }),
			supabase
				.from("BudgetItem")
				.select("*")
				.eq("plan_id", planId)
				.order("created_at", { ascending: true }),
			supabase
				.from("PackingItem")
				.select("*")
				.eq("plan_id", planId)
				.order("category", { ascending: true }),
		]).then(([itinerary, budget, packing]) => {
			setItineraryItems(itinerary.data || []);
			setBudgetItems(budget.data || []);
			setPackingItems(packing.data || []);
			setLoading(false);
		});
	}, [planId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mb-4" />
					<p className="text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	const tabs = [
		{ id: "itinerary" as const, label: "Itinerary", icon: Calendar },
		{ id: "budget" as const, label: "Budget", icon: DollarSign },
		{ id: "packing" as const, label: "Packing List", icon: Package },
	];

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
			<div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="bg-red-600 p-2 sm:p-3 rounded-lg">
								<Plane className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
							</div>
							<div>
								<h1 className="text-gray-100 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
									Trip Planner
								</h1>
								<span className="grid grid-cols-[auto_1fr] gap-2">
									<p className="place-self-center text-gray-400 text-xs sm:text-sm">
										Plan:{" "}
									</p>
									<h2 className="font-bold text-gray-100 text-sm sm:text-base md:text-lg">
										{plan.Name ||
											`Plan - ${new Date(plan.created_at).toLocaleDateString()}`}
									</h2>
								</span>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								onClick={() => navigate("/")}
								variant="secondary"
								size="sm"
							>
								Home
							</Button>
							<Button
								onClick={() => navigate(`/experience/${planId}`)}
								variant="secondary"
								size="sm"
								title="Experience Mode"
							>
								<Play className="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>
							<Button
								onClick={() => {
									navigator.clipboard.writeText(window.location.href);
									alert("Link copied to clipboard!");
								}}
								variant="secondary"
								size="sm"
								title="Share Plan"
							>
								<Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>
						</div>
					</div>
				</div>{" "}
				{/* Tabs */}
				<Card className="mb-6">
					<CardHeader className="pb-0">
						<div className="flex gap-1 border-b border-gray-700 w-full overflow-x-auto">
							{tabs.map((tab) => (
								<button
									type="button"
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
										activeTab === tab.id
											? "border-red-400 text-red-400"
											: "border-transparent text-gray-400 hover:text-red-400"
									}`}
								>
									<tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
									{tab.label}
								</button>
							))}
						</div>
					</CardHeader>

					<CardContent className="p-4 sm:p-6">
						{activeTab === "itinerary" && (
							<ItineraryList
								items={itineraryItems}
								planId={planId}
								onUpdate={() => {}}
							/>
						)}
						{activeTab === "budget" && (
							<BudgetList
								items={budgetItems}
								planId={planId}
								onUpdate={() => {}}
							/>
						)}
						{activeTab === "packing" && (
							<PackingList
								items={packingItems}
								planId={planId}
								onUpdate={() => {}}
							/>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
