import { Plus, Trash2 } from "lucide-react";
import { useFetcher } from "react-router";
import type { ItineraryItem } from "~/lib/prisma/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "../ui/table";

interface ItineraryListProps {
	items: ItineraryItem[];
	planId: string;
}

export const ItineraryList = ({ items, planId }: ItineraryListProps) => {
	const fetcher = useFetcher();

	const handleAdd = () => {
		fetcher.submit(
			{
				city: "",
				activity: "",
				description: "",
				datetime: new Date().toISOString(),
			},
			{
				method: "POST",
				action: `/api/itinerary/${planId}`,
				encType: "application/json",
			},
		);
	};

	const handleUpdate = (id: string, field: string, value: string) => {
		fetcher.submit(
			{ id, [field]: value },
			{
				method: "PUT",
				action: `/api/itinerary/${planId}`,
				encType: "application/json",
			},
		);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this item?")) {
			fetcher.submit(
				{ id },
				{
					method: "DELETE",
					action: `/api/itinerary/${planId}`,
					encType: "application/json",
				},
			);
		}
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
					Itinerary
				</h2>
				<Button onClick={handleAdd} size="sm">
					<Plus className="w-4 h-4" />
					Add Item
				</Button>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableCell header>Date</TableCell>
						<TableCell header>City</TableCell>
						<TableCell header>Activity</TableCell>
						<TableCell header>Description</TableCell>
						<TableCell header>Actions</TableCell>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.id}>
							<TableCell>
								<Input
									type="datetime-local"
									defaultValue={new Date(item.datetime)
										.toISOString()
										.slice(0, 16)}
									onBlur={(e) =>
										handleUpdate(item.id, "datetime", e.target.value)
									}
									className="min-w-[180px] w-full"
								/>
							</TableCell>
							<TableCell>
								<Input
									type="text"
									defaultValue={item.city}
									onBlur={(e) => handleUpdate(item.id, "city", e.target.value)}
									placeholder="City"
								/>
							</TableCell>
							<TableCell>
								<Input
									type="text"
									defaultValue={item.activity}
									onBlur={(e) =>
										handleUpdate(item.id, "activity", e.target.value)
									}
									placeholder="Activity"
								/>
							</TableCell>
							<TableCell>
								<Input
									type="text"
									defaultValue={item.description || ""}
									onBlur={(e) =>
										handleUpdate(item.id, "description", e.target.value)
									}
									placeholder="Description"
								/>
							</TableCell>
							<TableCell>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDelete(item.id)}
								>
									<Trash2 className="w-4 h-4 text-red-600" />
								</Button>
							</TableCell>
						</TableRow>
					))}
					{items.length === 0 && (
						<TableRow>
							<TableCell className="text-center text-gray-500 py-8" colSpan={5}>
								No itinerary items yet. Click "Add Item" to get started.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
