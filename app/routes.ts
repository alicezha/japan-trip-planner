import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("plan/:planId", "routes/plan.$planId.tsx"),
	route("experience/:planId", "routes/experience.$planId.tsx"),
	route("login", "routes/login.tsx"),
	route("auth/callback", "routes/auth.callback.tsx"),
	route("api/auth", "routes/api.auth.ts"),
	route("api/plans", "routes/api.plans.ts"),
	route("api/itinerary/:planId", "routes/api.itinerary.$planId.ts"),
	route("api/budget/:planId", "routes/api.budget.$planId.ts"),
	route("api/packing/:planId", "routes/api.packing.$planId.ts"),
] satisfies RouteConfig;
