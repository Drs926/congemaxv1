import { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../auth/middleware.js";
import { getDb } from "../db/client.js";

type PlanningRow = {
  id: string;
  profile_id: string;
  date: string;
  worked_unit: number;
  posable: boolean;
  blocked: boolean;
};

type InitBody = {
  year?: number;
};

type PatchDayBody = {
  date?: string;
  worked_unit?: number;
  posable?: boolean;
  blocked?: boolean;
};

type PlanningQuery = {
  date_from?: string;
  date_to?: string;
  month?: string;
};

const MIN_YEAR = 2020;
const MAX_YEAR = 2035;
const MAX_RANGE_DAYS = 62;

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

const toDateOnly = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const parseMonth = (value: string): { from: string; to: string } | null => {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }
  const [yearRaw, monthRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0));
  return { from: toDateOnly(from), to: toDateOnly(to) };
};

const isValidWorkedUnit = (value: unknown): value is 0 | 0.5 | 1 => {
  return value === 0 || value === 0.5 || value === 1;
};

const resolveProfileId = async (userId: string): Promise<string | null> => {
  const db = getDb();
  const profile = await db.query<{ id: string }>(
    "select id from profiles where user_id = $1",
    [userId],
  );
  return profile.rows[0]?.id ?? null;
};

export const planningRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: InitBody }>(
    "/planning/init",
    { preHandler: requireAuth },
    async (request, reply) => {
      const rawYear = request.body?.year;
      if (
        rawYear === undefined ||
        !Number.isInteger(rawYear) ||
        rawYear < MIN_YEAR ||
        rawYear > MAX_YEAR
      ) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      const year = rawYear;

      const profileId = await resolveProfileId(request.user!.id);
      if (!profileId) {
        return reply.code(404).send({ error: "Profile not found" });
      }

      const fromDate = `${year}-01-01`;
      const toDate = `${year}-12-31`;
      const db = getDb();

      try {
        await db.query("BEGIN");

        const existing = await db.query<{ count: string }>(
          `select count(*)::text as count
           from planning
           where profile_id = $1
             and date between $2::date and $3::date`,
          [profileId, fromDate, toDate],
        );

        if (Number(existing.rows[0]?.count ?? "0") > 0) {
          await db.query("ROLLBACK");
          return reply.code(409).send({ error: "Planning already initialized" });
        }

        const inserted = await db.query<{ count: string }>(
          `insert into planning(profile_id, date, worked_unit, posable, blocked)
           select $1::uuid, gs::date, 1, true, false
           from generate_series($2::date, $3::date, interval '1 day') as gs
           returning id`,
          [profileId, fromDate, toDate],
        );

        await db.query("COMMIT");
        return reply.code(201).send({
          year,
          days_created: inserted.rowCount ?? inserted.rows.length,
        });
      } catch (error: unknown) {
        await db.query("ROLLBACK");
        const code = (error as { code?: string })?.code;
        if (code === "23505") {
          return reply.code(409).send({ error: "Planning already initialized" });
        }
        throw error;
      }
    },
  );

  fastify.patch<{ Body: PatchDayBody }>(
    "/planning/day",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { date, worked_unit, posable, blocked } = request.body ?? {};
      if (!date) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      if (
        worked_unit === undefined &&
        posable === undefined &&
        blocked === undefined
      ) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      const parsedDate = parseDateOnly(date);
      if (!parsedDate) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      if (worked_unit !== undefined && !isValidWorkedUnit(worked_unit)) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      if (posable !== undefined && typeof posable !== "boolean") {
        return reply.code(400).send({ error: "Invalid input" });
      }
      if (blocked !== undefined && typeof blocked !== "boolean") {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const profileId = await resolveProfileId(request.user!.id);
      if (!profileId) {
        return reply.code(404).send({ error: "Profile not found" });
      }

      const db = getDb();
      const existing = await db.query<PlanningRow>(
        `select id, profile_id, date::text as date, worked_unit, posable, blocked
         from planning
         where profile_id = $1 and date = $2::date`,
        [profileId, date],
      );

      if (existing.rows.length === 0) {
        return reply.code(404).send({ error: "Planning day not found" });
      }

      const current = existing.rows[0];
      const nextWorkedUnit = worked_unit ?? current.worked_unit;
      const nextBlocked = blocked ?? current.blocked;
      let nextPosable = posable ?? current.posable;
      if (nextBlocked) {
        nextPosable = false;
      }

      const updated = await db.query<PlanningRow>(
        `update planning
         set worked_unit = $3, posable = $4, blocked = $5
         where profile_id = $1 and date = $2::date
         returning id, profile_id, date::text as date, worked_unit, posable, blocked`,
        [profileId, date, nextWorkedUnit, nextPosable, nextBlocked],
      );

      return reply.send(updated.rows[0]);
    },
  );

  fastify.get<{ Querystring: PlanningQuery }>(
    "/planning",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { date_from, date_to, month } = request.query ?? {};
      let rangeFrom: string | undefined;
      let rangeTo: string | undefined;

      if (month !== undefined) {
        if (date_from !== undefined || date_to !== undefined) {
          return reply.code(400).send({ error: "Invalid input" });
        }
        const parsedMonth = parseMonth(month);
        if (!parsedMonth) {
          return reply.code(400).send({ error: "Invalid input" });
        }
        rangeFrom = parsedMonth.from;
        rangeTo = parsedMonth.to;
      } else {
        if (!date_from || !date_to) {
          return reply.code(400).send({ error: "Invalid input" });
        }
        if (!parseDateOnly(date_from) || !parseDateOnly(date_to)) {
          return reply.code(400).send({ error: "Invalid input" });
        }
        rangeFrom = date_from;
        rangeTo = date_to;
      }

      const from = parseDateOnly(rangeFrom)!;
      const to = parseDateOnly(rangeTo)!;
      if (to < from) {
        return reply.code(400).send({ error: "Invalid input" });
      }
      const rangeDays = Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
      if (rangeDays > MAX_RANGE_DAYS) {
        return reply.code(400).send({ error: "Range too large" });
      }

      const profileId = await resolveProfileId(request.user!.id);
      if (!profileId) {
        return reply.code(404).send({ error: "Profile not found" });
      }

      const db = getDb();
      const result = await db.query<PlanningRow>(
        `select id, profile_id, date::text as date, worked_unit, posable, blocked
         from planning
         where profile_id = $1
           and date between $2::date and $3::date
         order by date asc`,
        [profileId, rangeFrom, rangeTo],
      );

      return reply.send({
        date_from: rangeFrom,
        date_to: rangeTo,
        days: result.rows,
      });
    },
  );
};
