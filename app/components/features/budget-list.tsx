import { Plus, Trash2 } from "lucide-react";
import { useFetcher } from "react-router";
import type { BudgetItem } from "~/lib/prisma/client";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "../ui/table";

interface BudgetListProps {
	items: BudgetItem[];
	planId: string;
}

export const BudgetList = ({ items, planId }: BudgetListProps) => {
	const fetcher = useFetcher();

	const handleAdd = () => {
		fetcher.submit(
			{
				category: "MISCELLANEOUS",
				item: "",
				estimated: 0,
				actual: 0,
				paid: false,
			},
			{
				method: "POST",
				action: `/api/budget/${planId}`,
				encType: "application/json",
			},
		);
	};

	const handleUpdate = (
		id: string,
		field: string,
		value: string | number | boolean,
	) => {
		fetcher.submit(
			{ id, [field]: value },
			{
				method: "PUT",
				action: `/api/budget/${planId}`,
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
					action: `/api/budget/${planId}`,
					encType: "application/json",
				},
			);
		}
	};

	const totalEstimated = items.reduce(
		(sum, item) => sum + (item.estimated || 0),
		0,
	);
	const totalActual = items.reduce((sum, item) => sum + (item.actual || 0), 0);
	const difference = totalActual - totalEstimated;

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-gray-900">Budget</h2>
				<Button onClick={handleAdd} size="sm">
					<Plus className="w-4 h-4" />
					Add Item
				</Button>
			</div>

			<div className="grid grid-cols-3 gap-4 mb-6">
				<div className="bg-blue-50 p-4 rounded-lg">
					<p className="text-sm text-gray-600 mb-1">Estimated</p>
					<p className="text-2xl font-bold text-blue-600">
						${totalEstimated.toFixed(2)}
					</p>
				</div>
				<div className="bg-green-50 p-4 rounded-lg">
					<p className="text-sm text-gray-600 mb-1">Actual</p>
					<p className="text-2xl font-bold text-green-600">
						${totalActual.toFixed(2)}
					</p>
				</div>
				<div
					className={`p-4 rounded-lg ${difference > 0 ? "bg-red-50" : "bg-green-50"}`}
				>
					<p className="text-sm text-gray-600 mb-1">Difference</p>
					<p
						className={`text-2xl font-bold ${difference > 0 ? "text-red-600" : "text-green-600"}`}
					>
						{difference > 0 ? "+" : ""}${difference.toFixed(2)}
					</p>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableCell header>Category</TableCell>
						<TableCell header>Item</TableCell>
						<TableCell header>Estimated</TableCell>
						<TableCell header>Actual</TableCell>
						<TableCell header>Paid</TableCell>
						<TableCell header>Actions</TableCell>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.id}>
							<TableCell>
								<select
									defaultValue={item.category}
									onChange={(e) =>
										handleUpdate(item.id, "category", e.target.value)
									}
									className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
								>
									<option value="TRANSPORTATION">Transportation</option>
									<option value="ACCOMMODATION">Accommodation</option>
									<option value="FOOD">Food</option>
									<option value="ACTIVITIES">Activities</option>
									<option value="MISCELLANEOUS">Miscellaneous</option>
								</select>
							</TableCell>
							<TableCell>
								<Input
									type="text"
									defaultValue={item.item}
									onBlur={(e) => handleUpdate(item.id, "item", e.target.value)}
									placeholder="Item"
								/>
							</TableCell>
							<TableCell>
								<Input
									type="number"
									step="0.01"
									defaultValue={item.estimated}
									onBlur={(e) =>
										handleUpdate(
											item.id,
											"estimated",
											Number.parseFloat(e.target.value),
										)
									}
									placeholder="0.00"
									className="w-28"
								/>
							</TableCell>
							<TableCell>
								<Input
									type="number"
									step="0.01"
									defaultValue={item.actual || ""}
									onBlur={(e) =>
										handleUpdate(
											item.id,
											"actual",
											e.target.value ? Number.parseFloat(e.target.value) : 0,
										)
									}
									placeholder="0.00"
									className="w-28"
								/>
							</TableCell>
							<TableCell>
								<Checkbox
									checked={item.paid}
									onChange={(e) =>
										handleUpdate(item.id, "paid", e.target.checked)
									}
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
							<TableCell className="text-center text-gray-500 py-8" colSpan={6}>
								No budget items yet. Click "Add Item" to get started.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
