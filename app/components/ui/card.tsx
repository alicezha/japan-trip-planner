import type { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
}

export const Card = ({ className = "", children }: CardProps) => (
	<div
		className={`bg-gray-800 border border-gray-700 rounded-lg shadow-sm ${className}`}
	>
		{children}
	</div>
);

export const CardHeader = ({ children, className = "" }: CardProps) => {
	return (
		<div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
			{children}
		</div>
	);
};

export const CardContent = ({ children, className = "" }: CardProps) => {
	return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = "" }: CardProps) => {
	return (
		<h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
			{children}
		</h3>
	);
};
