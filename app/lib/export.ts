export const exportToCSV = (
	data: Record<string, unknown>[],
	filename: string,
	columns: string[],
) => {
	if (!data.length) return;

	// Create CSV header
	const header = columns.join(",");

	// Create CSV rows
	const rows = data.map((item) =>
		columns
			.map((col) => {
				const value = item[col];
				// Handle values with commas or quotes
				if (
					typeof value === "string" &&
					(value.includes(",") || value.includes('"'))
				) {
					return `"${value.replace(/"/g, '""')}"`;
				}
				return value;
			})
			.join(","),
	);

	// Combine header and rows
	const csv = [header, ...rows].join("\n");

	// Create blob and download
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
