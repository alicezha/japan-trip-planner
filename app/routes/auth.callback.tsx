import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/client";

export default function AuthCallback() {
	const navigate = useNavigate();

	useEffect(() => {
		// Handle the OAuth callback
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				// Redirect to home on successful auth
				navigate("/");
			} else {
				// Redirect to login if no session
				navigate("/login");
			}
		});
	}, [navigate]);

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
			<div className="text-center">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mb-4" />
				<p className="text-gray-400">Completing sign in...</p>
			</div>
		</div>
	);
}
