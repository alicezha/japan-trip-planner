import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const Checkbox = ({
	label,
	className = "",
	...props
}: CheckboxProps) => {
	return (
		<label className="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				className={`w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer ${className}`}
				{...props}
			/>
			{label && <span className="text-sm text-gray-700">{label}</span>}
		</label>
	);
};
