import type { ReactNode } from "react";

interface TableProps {
	children: ReactNode;
}

export const Table = ({ children }: TableProps) => {
	return (
		<div className="overflow-x-auto">
			<table className="w-full">{children}</table>
		</div>
	);
};

export const TableHeader = ({ children }: TableProps) => {
	return (
		<thead className="bg-gray-50 border-b border-gray-200">{children}</thead>
	);
};

export const TableBody = ({ children }: TableProps) => {
	return <tbody className="divide-y divide-gray-200">{children}</tbody>;
};

interface TableRowProps {
	children: ReactNode;
	className?: string;
}

export const TableRow = ({ children, className = "" }: TableRowProps) => {
	return (
		<tr className={`hover:bg-gray-50 transition-colors ${className}`}>
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
	const Component = header ? "th" : "td";
	const baseStyles = header
		? "px-4 py-3 text-left text-sm font-medium text-gray-700"
		: "px-4 py-3 text-sm text-gray-900";

	return (
		<Component className={`${baseStyles} ${className}`} colSpan={colSpan}>
			{children}
		</Component>
	);
};
