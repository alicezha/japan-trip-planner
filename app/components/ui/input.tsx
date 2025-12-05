import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export const Input = ({
	label,
	error,
	className = "",
	id,
	...props
}: InputProps) => {
	const inputId =
		id || props.name || `input-${Math.random().toString(36).slice(2, 9)}`;
	return (
		<div className="w-full">
			{label && (
				<label
					htmlFor={inputId}
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					{label}
				</label>
			)}
			<input
				id={inputId}
				style={{
					colorScheme: "dark",
				}}
				className={`px-3 py-2 border rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
					error ? "border-red-500" : "border-gray-600"
				} ${className}`}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};
