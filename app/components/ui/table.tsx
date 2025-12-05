import type { ReactNode } from "react";

interface TableProps {
	children: ReactNode;
	className?: string;
}

export const Table = ({ className = "", children }: TableProps) => (
	<div className="overflow-x-auto rounded-lg border border-gray-700">
		<table className={`w-full ${className}`}>{children}</table>
	</div>
);

export const TableHeader = ({ className = "", children }: TableProps) => (
	<thead className={`bg-gray-800 border-b border-gray-700 ${className}`}>
		{children}
	</thead>
);

export const TableBody = ({ className = "", children }: TableProps) => (
	<tbody className={`divide-y divide-gray-700 ${className}`}>{children}</tbody>
);

interface TableRowProps {
	children: ReactNode;
	className?: string;
}

export const TableRow = ({ children, className = "" }: TableRowProps) => {
	return (
		<tr className={`hover:bg-gray-700/50 transition-colors ${className}`}>
			{children}
		</tr>
	);
};

interface TableCellProps {
	children: ReactNode;
	className?: string;
	header?: boolean;
	colSpan?: number;
}

export const TableCell = ({
	children,
	className = "",
	header = false,
	colSpan,
}: TableCellProps) => {
	return (
		<>
			{header ? (
				<th
					colSpan={colSpan}
					className={`px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider ${className}`}
				>
					{children}
				</th>
			) : (
				<td
					colSpan={colSpan}
					className={`px-4 py-3 text-sm text-gray-300 ${className}`}
				>
					{children}
				</td>
			)}
		</>
	);
};
