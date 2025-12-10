import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "./client";

export const useAuth = (options?: { redirectIfNoAuth?: boolean }) => {
	const navigate = useNavigate();
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [signingOut, setSigningOut] = useState(false);
	const shouldRedirect = options?.redirectIfNoAuth ?? false;

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setLoading(false);
			if (!session && shouldRedirect) {
				navigate("/login");
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (!session && shouldRedirect) {
				navigate("/login");
			}
		});

		return () => subscription.unsubscribe();
	}, [navigate, shouldRedirect]);

	const signOut = async () => {
		setSigningOut(true);
		await supabase.auth.signOut();
		navigate("/login");
	};

	return { session, loading, signingOut, signOut };
};
