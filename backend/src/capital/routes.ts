import { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../auth/middleware.js";
import { getDb } from "../db/client.js";

type CapitalRow = {
  id: string;
  profile_id: string;
  cp_remaining: number;
  rtt_remaining: number;
  calculated: boolean;
  updated_at: string;
};

type CapitalBody = {
  cp_remaining?: number;
  rtt_remaining?: number;
  calculated?: boolean;
};

const isValidAmount = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
};

const resolveProfileId = async (userId: string): Promise<string | null> => {
  const db = getDb();
  const profile = await db.query<{ id: string }>(
    "select id from profiles where user_id = $1",
    [userId],
  );
  return profile.rows[0]?.id ?? null;
};

export const capitalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/capital", { preHandler: requireAuth }, async (request, reply) => {
    const profileId = await resolveProfileId(request.user!.id);
    if (!profileId) {
      return reply.code(404).send({ error: "Profile not found" });
    }

    const db = getDb();
    const result = await db.query<CapitalRow>(
      `select id, profile_id, cp_remaining, rtt_remaining, calculated, updated_at
       from capital
       where profile_id = $1`,
      [profileId],
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: "Capital not found" });
    }

    return reply.send(result.rows[0]);
  });

  fastify.put<{ Body: CapitalBody }>(
    "/capital",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { cp_remaining, rtt_remaining, calculated } = request.body ?? {};
      if (!isValidAmount(cp_remaining) || !isValidAmount(rtt_remaining)) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      if (calculated === true) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const profileId = await resolveProfileId(request.user!.id);
      if (!profileId) {
        return reply.code(404).send({ error: "Profile not found" });
      }

      const db = getDb();
      const result = await db.query<CapitalRow>(
        `insert into capital(profile_id, cp_remaining, rtt_remaining, calculated, updated_at)
         values ($1, $2, $3, false, now())
         on conflict (profile_id)
         do update set
           cp_remaining = excluded.cp_remaining,
           rtt_remaining = excluded.rtt_remaining,
           calculated = false,
           updated_at = now()
         returning id, profile_id, cp_remaining, rtt_remaining, calculated, updated_at`,
        [profileId, cp_remaining, rtt_remaining],
      );

      return reply.send(result.rows[0]);
    },
  );
};
