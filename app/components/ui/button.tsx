import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
}

export const Button = ({
	children,
	variant = "primary",
	size = "md",
	className = "",
	...props
}: ButtonProps) => {
	const baseStyles =
		"inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const variants = {
		primary:
			"bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-700 disabled:text-gray-500",
		secondary:
			"bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-800 disabled:text-gray-600",
		danger:
			"bg-red-700 text-white hover:bg-red-800 focus:ring-red-600 disabled:bg-gray-700 disabled:text-gray-500",
		ghost: "bg-transparent text-gray-300 hover:bg-gray-700 focus:ring-gray-500",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm gap-1.5",
		md: "px-4 py-2 text-base gap-2",
		lg: "px-6 py-3 text-lg gap-2.5",
	};

	return (
		<button
			type="button"
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};
