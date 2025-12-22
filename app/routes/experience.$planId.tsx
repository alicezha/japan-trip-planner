import { Check, CheckCircle2, Circle, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Description } from "~/components/ui/description";
import { supabase } from "~/lib/client";
import type { Tables } from "~/lib/types/supabase";

export function meta() {
	return [
		{ title: "Trip Planner - Experience Mode" },
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

interface GroupedItems {
	date: string;
	items: Tables<"ItineraryItem">[];
}

export default function Experience() {
	const { planId, plan } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const _fetcher = useFetcher();
	const [itineraryItems, setItineraryItems] = useState<
		Tables<"ItineraryItem">[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [timeUntilStart, setTimeUntilStart] = useState("");
	const [hasStarted, setHasStarted] = useState(false);

	useEffect(() => {
		supabase
			.from("ItineraryItem")
			.select("*")
			.eq("plan_id", planId)
			.order("datetime", { ascending: true })
			.then(({ data }) => {
				setItineraryItems(data || []);
				setLoading(false);
			});
	}, [planId]);

	useEffect(() => {
		if (itineraryItems.length === 0) return;

		const firstItemDate = new Date(itineraryItems[0].datetime);
		const now = new Date();

		if (now >= firstItemDate) {
			setHasStarted(true);
			return;
		}

		const updateTimer = () => {
			const now = new Date();
			const diff = firstItemDate.getTime() - now.getTime();

			if (diff <= 0) {
				setHasStarted(true);
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
			);
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			setTimeUntilStart(`${days}d ${hours}h ${minutes}m ${seconds}s`);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [itineraryItems]);

	const handleToggleComplete = async (itemId: string, completed: boolean) => {
		// Optimistically update UI
		setItineraryItems((items) =>
			items.map((item) =>
				item.id === itemId ? { ...item, completed: !completed } : item,
			),
		);

		await supabase
			.from("ItineraryItem")
			.update({ completed: !completed })
			.eq("id", itemId);
	};

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

	// Group items by day
	const groupedByDay: GroupedItems[] = itineraryItems.reduce(
		(acc: GroupedItems[], item) => {
			const date = new Date(item.datetime).toLocaleDateString();
			const existing = acc.find((g) => g.date === date);
			if (existing) {
				existing.items.push(item);
			} else {
				acc.push({ date, items: [item] });
			}
			return acc;
		},
		[],
	);

	// Calculate progress
	const totalItems = itineraryItems.length;
	const completedItems = itineraryItems.filter((item) => item.completed).length;
	const progressPercent =
		totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

	// Find current day
	const today = new Date().toLocaleDateString();
	const currentDayIndex = groupedByDay.findIndex((g) => g.date === today);

	// Handle empty itinerary
	if (itineraryItems.length === 0) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
				<div className="text-center max-w-2xl mx-auto">
					<h1 className="text-4xl font-bold text-gray-100 mb-4">
						No Itinerary Items
					</h1>
					<p className="text-gray-400 mb-8">
						This plan doesn't have any itinerary items yet.
					</p>
					<Button onClick={() => navigate(`/`)} variant="secondary" size="lg">
						Home
					</Button>
				</div>
			</div>
		);
	}

	if (!hasStarted && itineraryItems.length > 0) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
				<div className="text-center max-w-2xl mx-auto px-4">
					<div className="bg-linear-to-br from-red-500 to-red-600 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
							{plan.Name || "Your Trip"}
						</h1>
						<p className="text-red-100 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8">
							Your adventure begins in
						</p>
						<div className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 md:mb-8 font-mono">
							{timeUntilStart}
						</div>
						<p className="text-red-100 text-lg">
							Starting {new Date(itineraryItems[0].datetime).toLocaleString()}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							onClick={() => navigate(`/plan/${planId}`)}
							variant="secondary"
							size="lg"
						>
							View Plan
						</Button>
						<Button onClick={() => navigate(`/`)} variant="secondary" size="lg">
							Home
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
			<div className="container mx-auto p-4 sm:p-6 md:p-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
						<div>
							<p className="text-gray-400 text-sm">Experience Mode</p>
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100">
								{plan.Name ||
									`Plan - ${new Date(plan.created_at).toLocaleDateString()}`}
							</h1>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								onClick={() => navigate(`/`)}
								variant="secondary"
								size="sm"
							>
								Home
							</Button>
							<Button
								onClick={() => navigate(`/plan/${planId}`)}
								variant="secondary"
								size="sm"
							>
								View Plan
							</Button>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="bg-gray-800 rounded-lg p-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-gray-300 font-medium">
								Overall Progress
							</span>
							<span className="text-gray-300 font-medium">
								{completedItems} / {totalItems}
							</span>
						</div>
						<div className="w-full bg-gray-700 rounded-full h-3">
							<div
								className="bg-linear-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Days */}
				<div className="space-y-6">
					{groupedByDay.map((group, dayIndex) => {
						const isToday = group.date === today;
						const _isPast = dayIndex < currentDayIndex;
						const dayCompleted = group.items.every((item) => item.completed);

						return (
							<Card
								key={group.date}
								className={`${
									isToday
										? "border-2 border-red-400 shadow-lg shadow-red-400/20"
										: ""
								}`}
							>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											{dayCompleted ? (
												<CheckCircle2 className="w-6 h-6 text-green-400" />
											) : (
												<Circle className="w-6 h-6 text-gray-500" />
											)}
											<div>
												<h2 className="text-2xl font-bold text-gray-100">
													{new Date(group.items[0].datetime).toLocaleDateString(
														"en-US",
														{
															weekday: "long",
															year: "numeric",
															month: "long",
															day: "numeric",
														},
													)}
												</h2>
												{isToday && (
													<p className="text-red-400 text-sm font-medium">
														Today
													</p>
												)}
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm text-gray-400">
												{group.items.filter((i) => i.completed).length} /{" "}
												{group.items.length} completed
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{group.items.map((item) => (
											<div
												key={item.id}
												className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
													item.completed
														? "bg-gray-800/50 opacity-75"
														: "bg-gray-800 hover:bg-gray-750"
												}`}
											>
												<button
													type="button"
													onClick={() =>
														handleToggleComplete(item.id, item.completed)
													}
													className="shrink-0 mt-1"
												>
													{item.completed ? (
														<CheckCircle2 className="w-6 h-6 text-green-400" />
													) : (
														<Circle className="w-6 h-6 text-gray-500 hover:text-red-400 transition-colors" />
													)}
												</button>
												<div className="flex-1">
													<div className="flex items-start justify-between gap-4">
														<div>
															<h3
																className={`text-lg font-medium ${
																	item.completed
																		? "text-gray-500 line-through"
																		: "text-gray-100"
																}`}
															>
																{item.activity}
															</h3>
															<div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
																<MapPin className="w-4 h-4" />
																<span>
																	{item.city}, {item.region}
																</span>
															</div>
															{item.description && (
																<Description content={item.description} />
															)}
														</div>
														<span className="text-sm text-gray-500">
															{new Date(item.datetime).toLocaleTimeString(
																"en-US",
																{
																	hour: "numeric",
																	minute: "2-digit",
																},
															)}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Completion Message */}
				{completedItems === totalItems && totalItems > 0 && (
					<Card className="mt-8 bg-linear-to-br from-green-900/50 to-green-800/50 border-green-400">
						<CardContent className="p-8 text-center">
							<Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
							<h2 className="text-3xl font-bold text-gray-100 mb-2">
								Trip Complete! 🎉
							</h2>
							<p className="text-gray-300">
								You've completed all {totalItems} activities in your itinerary!
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
