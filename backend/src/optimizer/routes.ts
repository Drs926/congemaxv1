import { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../auth/middleware.js";
import { getDb } from "../db/client.js";
import { LocalMode, optimizeLocal } from "./local.js";

type OptimizeLocalBody = {
  target_date?: string;
  mode?: LocalMode;
  delta_days?: number;
  max_cp_to_use?: number;
  top_n?: number;
};

type ProfileRow = {
  id: string;
  convention_code: string;
};

type CapitalRow = {
  cp_remaining: string | number;
};

type ConventionRow = {
  code: string;
  data: Record<string, unknown> | null;
  version: number | null;
};

type PlanningRow = {
  date: string;
  worked_unit: string | number;
  posable: boolean;
  blocked: boolean;
};

const MIN_YEAR = 2020;
const MAX_YEAR = 2035;

const parseDateOnly = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
};

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const buildSearchWindow = (
  targetDate: Date,
  mode: LocalMode,
  deltaDays: number,
): { from: string; to: string } => {
  const left = new Date(targetDate.getTime());
  const right = new Date(targetDate.getTime());
  const padding = mode === "strict" ? 30 : 30 + deltaDays;
  left.setUTCDate(left.getUTCDate() - padding);
  right.setUTCDate(right.getUTCDate() + padding);
  return { from: toDateOnly(left), to: toDateOnly(right) };
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

export const optimizerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: OptimizeLocalBody }>(
    "/optimize/local",
    { preHandler: requireAuth },
    async (request, reply) => {
      const body = request.body ?? {};
      const targetRaw = body.target_date;
      const mode = body.mode;

      if (!targetRaw || (mode !== "strict" && mode !== "flexible")) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const targetDate = parseDateOnly(targetRaw);
      if (!targetDate) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      const targetYear = targetDate.getUTCFullYear();
      if (targetYear < MIN_YEAR || targetYear > MAX_YEAR) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const deltaDays = body.delta_days ?? 0;
      if (
        mode === "flexible" &&
        (!Number.isInteger(deltaDays) || deltaDays < 0 || deltaDays > 14)
      ) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      if (mode === "strict" && body.delta_days !== undefined) {
        if (
          !Number.isInteger(body.delta_days) ||
          body.delta_days < 0 ||
          body.delta_days > 14
        ) {
          return reply.code(400).send({ error: "Invalid input" });
        }
      }

      const maxCpToUse = body.max_cp_to_use;
      if (
        maxCpToUse !== undefined &&
        (!isFiniteNumber(maxCpToUse) || maxCpToUse < 1)
      ) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const topN = body.top_n ?? 10;
      if (!Number.isInteger(topN) || topN < 1 || topN > 20) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const db = getDb();
      const profileRes = await db.query<ProfileRow>(
        "select id, convention_code from profiles where user_id = $1",
        [request.user!.id],
      );
      const profile = profileRes.rows[0];
      if (!profile) {
        return reply.code(404).send({ error: "Profile not found" });
      }

      const capitalRes = await db.query<CapitalRow>(
        "select cp_remaining from capital where profile_id = $1",
        [profile.id],
      );
      const capital = capitalRes.rows[0];
      if (!capital) {
        return reply.code(404).send({ error: "Capital not found" });
      }

      const conventionRes = await db.query<ConventionRow>(
        "select code, data, version from conventions where code = $1",
        [profile.convention_code],
      );
      const convention = conventionRes.rows[0];
      if (!convention) {
        return reply.code(404).send({ error: "Convention not found" });
      }

      const window = buildSearchWindow(targetDate, mode, deltaDays);
      const planningRes = await db.query<PlanningRow>(
        `select date::text as date, worked_unit, posable, blocked
         from planning
         where profile_id = $1
           and date between $2::date and $3::date
         order by date asc`,
        [profile.id, window.from, window.to],
      );

      const planning = planningRes.rows.map((row) => ({
        date: row.date,
        worked_unit: Number(row.worked_unit),
        posable: row.posable,
        blocked: row.blocked,
      }));

      const output = optimizeLocal({
        targetDate: targetRaw,
        mode,
        deltaDays,
        maxCpToUse,
        topN,
        searchWindowFrom: window.from,
        searchWindowTo: window.to,
        planning,
        capitalCpRemaining: Number(capital.cp_remaining),
        conventionData: convention.data ?? null,
        conventionCode: convention.code,
        conventionVersion: convention.version,
      });

      const parameters = {
        target_date: targetRaw,
        mode,
        delta_days: deltaDays,
        max_cp_to_use: maxCpToUse ?? null,
        top_n: topN,
        window,
      };

      const simulationRes = await db.query<{ id: string }>(
        `insert into simulations(profile_id, type, parameters)
         values ($1, 'local', $2::jsonb)
         returning id`,
        [profile.id, JSON.stringify(parameters)],
      );
      const simulationId = simulationRes.rows[0].id;

      const metrics = {
        options_count: output.options.length,
        top_efficiency: output.options[0]?.efficiency ?? null,
        rejection_counts: output.audit.rejection_counts,
        capital_effective_limit: output.audit.capital.effective_limit,
      };

      const allocation = {
        options: output.options,
        audit: output.audit,
      };

      await db.query(
        `insert into results(simulation_id, strategy_type, metrics, allocation)
         values ($1, null, $2::jsonb, $3::jsonb)`,
        [simulationId, JSON.stringify(metrics), JSON.stringify(allocation)],
      );

      return reply.send({
        simulation_id: simulationId,
        options: output.options,
        audit: output.audit,
      });
    },
  );
};
