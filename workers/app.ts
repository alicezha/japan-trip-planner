// @ts-expect-error - virtual module provided by React Router
import * as build from "virtual:react-router/server-build";
import { createRequestHandler } from "@react-router/cloudflare";

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    try {
      const handler = createRequestHandler(build, "production");

      // Pass the loadContext with cloudflare properties
      const response = await handler(request, {
        cloudflare: {
          env,
          ctx,
          cf: request.cf, // Add this - passes Cloudflare request properties
        },
      });

      return response;
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
