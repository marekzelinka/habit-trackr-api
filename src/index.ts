import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { env } from "../env.ts";
import { app } from "./app.ts";

serve({ fetch: app.fetch, port: env.PORT }, () => {
	console.log(`Server is running on http://${env.HOST}:${env.PORT}`);
	console.log(`Environment: ${env.APP_STAGE}`);
	console.log("Routes:");
	showRoutes(app);
});
