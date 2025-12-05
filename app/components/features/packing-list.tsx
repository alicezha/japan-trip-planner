import { Plus, Trash2 } from "lucide-react";
import { useFetcher } from "react-router";
import type { PackingItem } from "~/lib/prisma/client";
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

interface PackingListProps {
	items: PackingItem[];
	planId: string;
}

export const PackingList = ({ items, planId }: PackingListProps) => {
	const fetcher = useFetcher();

	const handleAdd = () => {
		fetcher.submit(
			{
				item: "",
				packed: false,
				category: "MISCELLANEOUS",
			},
			{
				method: "POST",
				action: `/api/packing/${planId}`,
				encType: "application/json",
			},
		);
	};

	const handleUpdate = (id: string, field: string, value: string | boolean) => {
		fetcher.submit(
			{ id, [field]: value },
			{
				method: "PUT",
				action: `/api/packing/${planId}`,
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
					action: `/api/packing/${planId}`,
					encType: "application/json",
				},
			);
		}
	};

	const packedCount = items.filter((item) => item.packed).length;
	const totalCount = items.length;
	const percentage = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
					Packing List
				</h2>
				<Button onClick={handleAdd} size="sm">
					<Plus className="w-4 h-4" />
					Add Item
				</Button>
			</div>

			<div className="mb-6 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 border-1 p-4 rounded-lg">
				<div className="flex justify-between items-center mb-2">
					<p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
					<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
						{packedCount} / {totalCount} items packed
					</p>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
					<div
						className="bg-green-500 h-full transition-all duration-300"
						style={{ width: `${percentage}%` }}
					/>
				</div>
				<p className="text-xs text-gray-600 mt-1 text-right">
					{percentage.toFixed(0)}% complete
				</p>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableCell header>Packed</TableCell>
						<TableCell header>Item</TableCell>
						<TableCell header>Category</TableCell>
						<TableCell header>Actions</TableCell>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.id}>
							<TableCell>
								<Checkbox
									checked={item.packed}
									onChange={(e) =>
										handleUpdate(item.id, "packed", e.target.checked)
									}
								/>
							</TableCell>
							<TableCell>
								<Input
									type="text"
									defaultValue={item.item}
									onBlur={(e) => handleUpdate(item.id, "item", e.target.value)}
									placeholder="Item"
									className={item.packed ? "line-through text-gray-500" : ""}
								/>
							</TableCell>
							<TableCell>
								<select
									defaultValue={item.category}
									onChange={(e) =>
										handleUpdate(item.id, "category", e.target.value)
									}
									className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
								>
									<option value="CLOTHING">Clothing</option>
									<option value="TOILETRIES">Toiletries</option>
									<option value="ELECTRONICS">Electronics</option>
									<option value="DOCUMENTS">Documents</option>
									<option value="MISCELLANEOUS">Miscellaneous</option>
								</select>
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
							<TableCell className="text-center text-gray-500 py-8" colSpan={4}>
								No packing items yet. Click "Add Item" to get started.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
