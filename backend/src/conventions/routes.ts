import { FastifyPluginAsync } from "fastify";
import { getDb } from "../db/client.js";
import { requireAuth } from "../auth/middleware.js";

export const conventionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/conventions/active",
    { preHandler: requireAuth },
    async (request, reply) => {
      void request;
      const db = getDb();
      const result = await db.query<{
        code: string;
        data: unknown;
        version: number;
      }>(
        "select code, data, version from conventions where code = 'IDCC_1801' limit 1",
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: "Convention not found" });
      }

      return result.rows[0];
    },
  );
};
