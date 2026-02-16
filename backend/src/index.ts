import Fastify from "fastify";
import { authRoutes } from "./auth/routes.js";
import { requireAuth } from "./auth/middleware.js";
import { conventionRoutes } from "./conventions/routes.js";
import { profileRoutes } from "./profile/routes.js";
import { planningRoutes } from "./planning/routes.js";
import { capitalRoutes } from "./capital/routes.js";
import { optimizerRoutes } from "./optimizer/routes.js";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3001);

app.register(authRoutes);
app.register(conventionRoutes);
app.register(profileRoutes);
app.register(planningRoutes);
app.register(capitalRoutes);
app.register(optimizerRoutes);

app.get("/health", async () => {
  return { ok: true };
});

app.get("/me", { preHandler: requireAuth }, async (request) => {
  return { id: request.user?.id };
});

const start = async (): Promise<void> => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
