import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/lib/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

// Browser client
export const createBrowserClient = () => {
	return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Server client
export const createServerClient = () => {
	return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Default export for client-side usage
export const supabase = createBrowserClient();
