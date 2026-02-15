import Fastify from "fastify";
import { authRoutes } from "./auth/routes.js";
import { requireAuth } from "./auth/middleware.js";
import { conventionRoutes } from "./conventions/routes.js";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3001);

app.register(authRoutes);
app.register(conventionRoutes);

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
