export type LocalMode = "strict" | "flexible";

export type PlanningDayInput = {
  date: string;
  worked_unit: number;
  posable: boolean;
  blocked: boolean;
};

export type LocalOptimizerInput = {
  targetDate: string;
  mode: LocalMode;
  deltaDays: number;
  maxCpToUse?: number;
  topN: number;
  searchWindowFrom: string;
  searchWindowTo: string;
  planning: PlanningDayInput[];
  capitalCpRemaining: number;
  conventionData: Record<string, unknown> | null;
  conventionCode: string;
  conventionVersion: number | null;
};

type AllocationDay = {
  date: string;
  worked_unit: number;
  posable: boolean;
  blocked: boolean;
  counts_as: "cp" | "rest";
  reason: "WORKED+POSABLE" | "WORKED+NOT_POSABLE" | "BLOCKED" | "WORKED_UNIT_0";
};

export type LocalOption = {
  start_date: string;
  end_date: string;
  days_total: number;
  cp_needed: number;
  rest_days: number;
  efficiency: number;
  allocation: {
    days: AllocationDay[];
  };
};

type RejectionCounts = {
  outside_mode_window: number;
  cp_needed_zero: number;
  cp_limit_exceeded: number;
};

export type LocalAudit = {
  status: "ok" | "no_solution";
  inputs: {
    target_date: string;
    mode: LocalMode;
    delta_days: number;
    max_cp_to_use: number | null;
    top_n: number;
  };
  capital: {
    available_cp: number;
    max_cp_to_use: number | null;
    effective_limit: number;
  };
  window_used: {
    from: string;
    to: string;
  };
  convention_used: {
    code: string;
    version: number | null;
    cp_base: unknown;
    annual_cap_days: unknown;
    continuous_service: unknown;
    night_work_allowed: unknown;
  };
  stats: {
    planning_days_loaded: number;
    candidates_evaluated: number;
    options_before_top_n: number;
    options_returned: number;
  };
  rejection_counts: RejectionCounts;
};

export type LocalOptimizerOutput = {
  options: LocalOption[];
  audit: LocalAudit;
};

const MIN_SEQUENCE_DAYS = 3;
const MAX_SEQUENCE_DAYS = 21;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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

const diffDays = (left: Date, right: Date): number => {
  return Math.round((left.getTime() - right.getTime()) / ONE_DAY_MS);
};

const buildContiguousSegments = (
  planning: PlanningDayInput[],
): PlanningDayInput[][] => {
  const sorted = [...planning].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) {
    return [];
  }

  const segments: PlanningDayInput[][] = [];
  let current: PlanningDayInput[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = parseDateOnly(sorted[i - 1].date);
    const next = parseDateOnly(sorted[i].date);
    if (!prev || !next) {
      continue;
    }

    if (diffDays(next, prev) === 1) {
      current.push(sorted[i]);
      continue;
    }

    segments.push(current);
    current = [sorted[i]];
  }

  segments.push(current);
  return segments;
};

const getReason = (
  day: PlanningDayInput,
): "WORKED+POSABLE" | "WORKED+NOT_POSABLE" | "BLOCKED" | "WORKED_UNIT_0" => {
  if (day.worked_unit > 0 && day.posable && !day.blocked) {
    return "WORKED+POSABLE";
  }
  if (day.blocked) {
    return "BLOCKED";
  }
  if (day.worked_unit === 0) {
    return "WORKED_UNIT_0";
  }
  return "WORKED+NOT_POSABLE";
};

const sequenceMatchesMode = (
  mode: LocalMode,
  sequenceStart: string,
  sequenceEnd: string,
  targetDate: string,
  deltaDays: number,
): boolean => {
  if (mode === "strict") {
    return sequenceStart <= targetDate && targetDate <= sequenceEnd;
  }

  const flexFromDate = parseDateOnly(targetDate);
  if (!flexFromDate) {
    return false;
  }
  const flexToDate = new Date(flexFromDate.getTime());
  const fromDate = new Date(flexFromDate.getTime());
  fromDate.setUTCDate(fromDate.getUTCDate() - deltaDays);
  flexToDate.setUTCDate(flexToDate.getUTCDate() + deltaDays);
  const flexFrom = fromDate.toISOString().slice(0, 10);
  const flexTo = flexToDate.toISOString().slice(0, 10);

  return !(sequenceEnd < flexFrom || sequenceStart > flexTo);
};

export const optimizeLocal = (input: LocalOptimizerInput): LocalOptimizerOutput => {
  const rejectionCounts: RejectionCounts = {
    outside_mode_window: 0,
    cp_needed_zero: 0,
    cp_limit_exceeded: 0,
  };

  const options: LocalOption[] = [];
  const effectiveLimit = Math.floor(
    Math.min(
      input.capitalCpRemaining,
      input.maxCpToUse ?? Number.POSITIVE_INFINITY,
    ),
  );

  const segments = buildContiguousSegments(input.planning);
  let candidatesEvaluated = 0;

  for (const segment of segments) {
    for (let start = 0; start < segment.length; start += 1) {
      for (
        let length = MIN_SEQUENCE_DAYS;
        length <= MAX_SEQUENCE_DAYS && start + length <= segment.length;
        length += 1
      ) {
        const sequence = segment.slice(start, start + length);
        const sequenceStart = sequence[0].date;
        const sequenceEnd = sequence[sequence.length - 1].date;

        if (
          !sequenceMatchesMode(
            input.mode,
            sequenceStart,
            sequenceEnd,
            input.targetDate,
            input.deltaDays,
          )
        ) {
          rejectionCounts.outside_mode_window += 1;
          continue;
        }

        candidatesEvaluated += 1;

        let cpNeeded = 0;
        let restDays = 0;
        const allocationDays: AllocationDay[] = [];

        for (const day of sequence) {
          const reason = getReason(day);
          const countsAsCp = reason === "WORKED+POSABLE";

          if (countsAsCp) {
            cpNeeded += 1;
          } else {
            restDays += 1;
          }

          allocationDays.push({
            date: day.date,
            worked_unit: day.worked_unit,
            posable: day.posable,
            blocked: day.blocked,
            counts_as: countsAsCp ? "cp" : "rest",
            reason,
          });
        }

        if (cpNeeded === 0) {
          rejectionCounts.cp_needed_zero += 1;
          continue;
        }

        if (cpNeeded > effectiveLimit) {
          rejectionCounts.cp_limit_exceeded += 1;
          continue;
        }

        options.push({
          start_date: sequenceStart,
          end_date: sequenceEnd,
          days_total: sequence.length,
          cp_needed: cpNeeded,
          rest_days: restDays,
          efficiency: Number((restDays / cpNeeded).toFixed(4)),
          allocation: {
            days: allocationDays,
          },
        });
      }
    }
  }

  options.sort((a, b) => {
    if (b.efficiency !== a.efficiency) {
      return b.efficiency - a.efficiency;
    }
    if (b.rest_days !== a.rest_days) {
      return b.rest_days - a.rest_days;
    }
    return a.cp_needed - b.cp_needed;
  });

  const topOptions = options.slice(0, input.topN);
  const convention = input.conventionData ?? {};

  return {
    options: topOptions,
    audit: {
      status: topOptions.length > 0 ? "ok" : "no_solution",
      inputs: {
        target_date: input.targetDate,
        mode: input.mode,
        delta_days: input.deltaDays,
        max_cp_to_use: input.maxCpToUse ?? null,
        top_n: input.topN,
      },
      capital: {
        available_cp: input.capitalCpRemaining,
        max_cp_to_use: input.maxCpToUse ?? null,
        effective_limit: effectiveLimit,
      },
      window_used: {
        from: input.searchWindowFrom,
        to: input.searchWindowTo,
      },
      convention_used: {
        code: input.conventionCode,
        version: input.conventionVersion,
        cp_base: convention.cp_base ?? null,
        annual_cap_days: convention.annual_cap_days ?? null,
        continuous_service: convention.continuous_service ?? null,
        night_work_allowed: convention.night_work_allowed ?? null,
      },
      stats: {
        planning_days_loaded: input.planning.length,
        candidates_evaluated: candidatesEvaluated,
        options_before_top_n: options.length,
        options_returned: topOptions.length,
      },
      rejection_counts: rejectionCounts,
    },
  };
};
