import {
	Calendar,
	DollarSign,
	Download,
	Lock,
	LogOut,
	Package,
	Plane,
	Play,
	Plus,
	Trash2,
	Unlock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BudgetList } from "~/components/features/budget-list";
import { ItineraryList } from "~/components/features/itinerary-list";
import { PackingList } from "~/components/features/packing-list";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/lib/client";
import { exportToCSV } from "~/lib/export";
import type { Tables } from "~/lib/types/supabase";

export function meta() {
	return [
		{ title: "Trip Planner" },
		{
			name: "description",
			content: "Plan your perfect journey",
		},
	];
}

type Tab = "itinerary" | "budget" | "packing";

const Home = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<Tab>("itinerary");
	const [plans, setPlans] = useState<Tables<"Plan">[]>([]);
	const [selectedPlanId, setSelectedPlanId] = useState<string>("");
	const [itineraryItems, setItineraryItems] = useState<
		Tables<"ItineraryItem">[]
	>([]);
	const [budgetItems, setBudgetItems] = useState<Tables<"BudgetItem">[]>([]);
	const [packingItems, setPackingItems] = useState<Tables<"PackingItem">[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const { session, loading, signingOut, signOut } = useAuth({
		redirectIfNoAuth: true,
	});

	const refreshData = () => setRefreshKey((prev) => prev + 1);

	// Load plans when authenticated
	useEffect(() => {
		if (!loading && session) {
			supabase
				.from("Plan")
				.select("*")
				.eq("owner", session.user.id)
				.order("created_at", { ascending: false })
				.then(({ data }) => {
					if (data && data.length > 0) {
						setPlans(data);
						setSelectedPlanId(data[0].id);
					} else {
						// Create first plan
						supabase
							.from("Plan")
							.insert({
								owner: session.user.id,
								visibility: "PRIVATE",
								updated_at: new Date().toISOString(),
							})
							.select()
							.single()
							.then(({ data: newPlan }) => {
								if (newPlan) {
									setPlans([newPlan]);
									setSelectedPlanId(newPlan.id);
								}
							});
					}
				});
		}
	}, [loading, session]);

	// Load items when plan selected
	useEffect(() => {
		if (selectedPlanId && refreshKey >= 0) {
			Promise.all([
				supabase
					.from("ItineraryItem")
					.select("*")
					.eq("plan_id", selectedPlanId)
					.order("created_at", { ascending: true }),
				supabase
					.from("BudgetItem")
					.select("*")
					.eq("plan_id", selectedPlanId)
					.order("created_at", { ascending: true }),
				supabase
					.from("PackingItem")
					.select("*")
					.eq("plan_id", selectedPlanId)
					.order("category", { ascending: true }),
			]).then(([itinerary, budget, packing]) => {
				setItineraryItems(itinerary.data || []);
				setBudgetItems(budget.data || []);
				setPackingItems(packing.data || []);
			});
		}
	}, [selectedPlanId, refreshKey]);
	if (loading || !selectedPlanId) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mb-4" />
					<p className="text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	const handlePlanChange = (planId: string) => {
		setSelectedPlanId(planId);
	};

	const handleAddPlan = async () => {
		if (!session) return;

		const planName = prompt("Enter a name for your new plan:");
		if (!planName || planName.trim() === "") return;

		const { data: newPlan } = await supabase
			.from("Plan")
			.insert({
				owner: session.user.id,
				visibility: "PRIVATE",
				Name: planName.trim(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (newPlan) {
			setPlans([...plans, newPlan]);
			setSelectedPlanId(newPlan.id);
		}
	};

	const handleDeletePlan = async () => {
		if (!confirm("Are you sure you want to delete this plan?")) return;
		if (plans.length <= 1) return;

		await supabase.from("Plan").delete().eq("id", selectedPlanId);

		const remainingPlans = plans.filter((p) => p.id !== selectedPlanId);
		setPlans(remainingPlans);
		setSelectedPlanId(remainingPlans[0]?.id || "");
	};

	const handleToggleVisibility = async () => {
		const currentPlan = plans.find((p) => p.id === selectedPlanId);
		if (!currentPlan) return;

		const newVisibility =
			currentPlan.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE";

		// If making public, confirm and copy link
		if (newVisibility === "PUBLIC") {
			const confirmed = confirm(
				"Make this plan public? Anyone with the link will be able to view it.",
			);
			if (!confirmed) return;
		}

		await supabase
			.from("Plan")
			.update({
				visibility: newVisibility,
				updated_at: new Date().toISOString(),
			})
			.eq("id", selectedPlanId);

		setPlans(
			plans.map((p) =>
				p.id === selectedPlanId ? { ...p, visibility: newVisibility } : p,
			),
		);

		// Copy link to clipboard if making public
		if (newVisibility === "PUBLIC") {
			const shareUrl = `${window.location.origin}/plan/${selectedPlanId}`;
			await navigator.clipboard.writeText(shareUrl);
			alert(`Link copied to clipboard!\n${shareUrl}`);
		}
	};

	const handleExport = () => {
		if (activeTab === "itinerary") {
			exportToCSV(
				itineraryItems as unknown as Record<string, unknown>[],
				"itinerary.csv",
				["datetime", "city", "activity", "description"],
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
		<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
			{signingOut && (
				<div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mb-4" />
						<p className="text-gray-100 text-lg">Signing out...</p>
					</div>
				</div>
			)}
			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div>
							<div className="flex items-center gap-2 sm:gap-3 mb-2">
								<Plane className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-400" />
								<h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-100">
									Trip Planner
								</h1>
							</div>
							<p className="text-gray-400 text-xs sm:text-sm md:text-base sm:ml-13">
								Plan your perfect journey
							</p>
						</div>
						<Button onClick={signOut} variant="secondary" size="sm">
							<LogOut className="w-4 h-4" />
							Sign Out
						</Button>
					</div>
				</div>{" "}
				{/* Tabs */}
				<Card className="mb-6">
					<CardHeader className="pb-0">
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
							<div className="flex items-center gap-2 flex-wrap">
								<select
									value={selectedPlanId}
									onChange={(e) => handlePlanChange(e.target.value)}
									className="bg-gray-800 text-gray-100 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
								>
									{plans.map((p) => (
										<option key={p.id} value={p.id}>
											{p.Name ||
												`Plan - ${new Date(p.created_at).toLocaleDateString()}`}
										</option>
									))}
								</select>
								<Button onClick={handleAddPlan} variant="secondary" size="sm">
									<Plus className="w-3 h-3 sm:w-4 sm:h-4" />
								</Button>
								<Button
									onClick={handleDeletePlan}
									variant="secondary"
									size="sm"
									disabled={plans.length <= 1}
								>
									<Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
								</Button>
								<Button
									onClick={handleToggleVisibility}
									variant="secondary"
									size="sm"
									title={
										plans.find((p) => p.id === selectedPlanId)?.visibility ===
										"PRIVATE"
											? "Make Public"
											: "Make Private"
									}
								>
									{plans.find((p) => p.id === selectedPlanId)?.visibility ===
									"PRIVATE" ? (
										<Lock className="w-3 h-3 sm:w-4 sm:h-4" />
									) : (
										<Unlock className="w-3 h-3 sm:w-4 sm:h-4" />
									)}
								</Button>
								<Button
									onClick={() => navigate(`/experience/${selectedPlanId}`)}
									variant="secondary"
									size="sm"
									title="Experience Mode"
									disabled={
										plans.find((p) => p.id === selectedPlanId)?.visibility ===
										"PRIVATE"
									}
								>
									<Play className="w-3 h-3 sm:w-4 sm:h-4" />
								</Button>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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
							<Button onClick={handleExport} variant="secondary" size="sm">
								<Download className="w-4 h-4" />
								Export CSV
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						{activeTab === "itinerary" && (
							<ItineraryList
								items={itineraryItems}
								planId={selectedPlanId}
								onUpdate={refreshData}
							/>
						)}
						{activeTab === "budget" && (
							<BudgetList
								items={budgetItems}
								planId={selectedPlanId}
								onUpdate={refreshData}
							/>
						)}
						{activeTab === "packing" && (
							<PackingList
								items={packingItems}
								planId={selectedPlanId}
								onUpdate={refreshData}
							/>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
export default Home;
