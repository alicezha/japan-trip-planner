export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "13.0.5";
	};
	api: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			BudgetItem: {
				Row: {
					actual: number | null;
					category: Database["public"]["Enums"]["BudgetCategory"];
					created_at: string;
					estimated: number;
					id: string;
					item: string;
					paid: boolean;
					plan_id: string;
					updated_at: string;
				};
				Insert: {
					actual?: number | null;
					category: Database["public"]["Enums"]["BudgetCategory"];
					created_at?: string;
					estimated: number;
					id?: string;
					item: string;
					paid?: boolean;
					plan_id: string;
					updated_at: string;
				};
				Update: {
					actual?: number | null;
					category?: Database["public"]["Enums"]["BudgetCategory"];
					created_at?: string;
					estimated?: number;
					id?: string;
					item?: string;
					paid?: boolean;
					plan_id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "BudgetItem_planId_fkey";
						columns: ["plan_id"];
						isOneToOne: false;
						referencedRelation: "Plan";
						referencedColumns: ["id"];
					},
				];
			};
			ItineraryItem: {
				Row: {
					activity: string;
					city: string;
					completed: boolean;
					country: string;
					created_at: string;
					datetime: string;
					description: string | null;
					id: string;
					plan_id: string;
					region: string;
					updated_at: string | null;
				};
				Insert: {
					activity: string;
					city: string;
					completed?: boolean;
					country: string;
					created_at?: string;
					datetime: string;
					description?: string | null;
					id?: string;
					plan_id: string;
					region: string;
					updated_at?: string | null;
				};
				Update: {
					activity?: string;
					city?: string;
					completed?: boolean;
					country?: string;
					created_at?: string;
					datetime?: string;
					description?: string | null;
					id?: string;
					plan_id?: string;
					region?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "ItineraryItem_planId_fkey";
						columns: ["plan_id"];
						isOneToOne: false;
						referencedRelation: "Plan";
						referencedColumns: ["id"];
					},
				];
			};
			PackingItem: {
				Row: {
					category: Database["public"]["Enums"]["PackingCategory"];
					created_at: string;
					id: string;
					item: string;
					packed: boolean;
					plan_id: string;
					updated_at: string;
				};
				Insert: {
					category: Database["public"]["Enums"]["PackingCategory"];
					created_at?: string;
					id?: string;
					item: string;
					packed?: boolean;
					plan_id: string;
					updated_at: string;
				};
				Update: {
					category?: Database["public"]["Enums"]["PackingCategory"];
					created_at?: string;
					id?: string;
					item?: string;
					packed?: boolean;
					plan_id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "PackingItem_planId_fkey";
						columns: ["plan_id"];
						isOneToOne: false;
						referencedRelation: "Plan";
						referencedColumns: ["id"];
					},
				];
			};
			Plan: {
				Row: {
					created_at: string;
					id: string;
					Name: string | null;
					owner: string;
					updated_at: string;
					visibility: Database["public"]["Enums"]["VisibilityType"];
				};
				Insert: {
					created_at?: string;
					id?: string;
					Name?: string | null;
					owner: string;
					updated_at: string;
					visibility?: Database["public"]["Enums"]["VisibilityType"];
				};
				Update: {
					created_at?: string;
					id?: string;
					Name?: string | null;
					owner?: string;
					updated_at?: string;
					visibility?: Database["public"]["Enums"]["VisibilityType"];
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			BudgetCategory:
				| "TRANSPORTATION"
				| "ACCOMMODATION"
				| "FOOD"
				| "ACTIVITIES"
				| "MISCELLANEOUS";
			PackingCategory:
				| "CLOTHING"
				| "TOILETRIES"
				| "ELECTRONICS"
				| "DOCUMENTS"
				| "MISCELLANEOUS";
			VisibilityType: "PUBLIC" | "PRIVATE";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	api: {
		Enums: {},
	},
	public: {
		Enums: {
			BudgetCategory: [
				"TRANSPORTATION",
				"ACCOMMODATION",
				"FOOD",
				"ACTIVITIES",
				"MISCELLANEOUS",
			],
			PackingCategory: [
				"CLOTHING",
				"TOILETRIES",
				"ELECTRONICS",
				"DOCUMENTS",
				"MISCELLANEOUS",
			],
			VisibilityType: ["PUBLIC", "PRIVATE"],
		},
	},
} as const;
