export const exportToCSV = (
	data: Record<string, unknown>[],
	filename: string,
	columns: string[],
): void => {
	if (data.length === 0) {
		alert("No data to export");
		return;
	}

	// Create CSV header
	const header = columns.join(",");

	// Create CSV rows
	const rows = data.map((row) => {
		return columns
			.map((col) => {
				const value = row[col];
				// Handle values that might contain commas or quotes
				if (value === null || value === undefined) return "";
				const stringValue = String(value);
				if (stringValue.includes(",") || stringValue.includes('"')) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			})
			.join(",");
	});

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
}
