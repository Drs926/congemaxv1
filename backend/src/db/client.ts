import { Pool } from "pg";

let pool: Pool | null = null;

export const getDb = (): Pool => {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  pool = new Pool({ connectionString: databaseUrl });
  return pool;
};

export const closeDb = async (): Promise<void> => {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
};
