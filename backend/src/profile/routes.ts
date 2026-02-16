import { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../auth/middleware.js";
import { getDb } from "../db/client.js";

type WorkType = "horaire" | "forfait";
type ForfaitGranularity = "day" | "half_day";

type ProfileBody = {
  work_type?: WorkType;
  seniority_years?: number;
  forfait_granularity?: ForfaitGranularity;
};

type ProfileRow = {
  id: string;
  user_id: string;
  convention_code: string;
  work_type: WorkType;
  seniority_years: number;
  forfait_granularity: ForfaitGranularity | null;
  created_at: string;
};

const isValidWorkType = (value: unknown): value is WorkType => {
  return value === "horaire" || value === "forfait";
};

const isValidForfaitGranularity = (
  value: unknown,
): value is ForfaitGranularity => {
  return value === "day" || value === "half_day";
};

export const profileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/profile", { preHandler: requireAuth }, async (request, reply) => {
    const db = getDb();
    const result = await db.query<ProfileRow>(
      `select id, user_id, convention_code, work_type, seniority_years, forfait_granularity, created_at
       from profiles
       where user_id = $1`,
      [request.user!.id],
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: "Profile not found" });
    }

    return reply.send(result.rows[0]);
  });

  fastify.post<{ Body: ProfileBody }>(
    "/profile",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { work_type, seniority_years, forfait_granularity } =
        request.body ?? {};

      if (!isValidWorkType(work_type)) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      if (
        !Number.isInteger(seniority_years) ||
        (seniority_years as number) < 0
      ) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      if (work_type === "forfait") {
        if (!isValidForfaitGranularity(forfait_granularity)) {
          return reply.code(400).send({ error: "Invalid input" });
        }
      } else if (forfait_granularity !== undefined) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const db = getDb();
      try {
        const result = await db.query<ProfileRow>(
          `insert into profiles(user_id, convention_code, work_type, seniority_years, forfait_granularity)
           values ($1, 'IDCC_1801', $2, $3, $4)
           returning id, user_id, convention_code, work_type, seniority_years, forfait_granularity, created_at`,
          [
            request.user!.id,
            work_type,
            seniority_years,
            work_type === "forfait" ? forfait_granularity : null,
          ],
        );
        return reply.code(201).send(result.rows[0]);
      } catch (error: unknown) {
        const code = (error as { code?: string })?.code;
        if (code === "23505") {
          return reply.code(409).send({ error: "Profile already exists" });
        }
        if (code === "23503") {
          return reply.code(400).send({ error: "Convention missing" });
        }
        throw error;
      }
    },
  );
};
