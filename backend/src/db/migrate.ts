import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const run = async (): Promise<void> => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migrations found");
    return;
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = await readFile(migrationPath, "utf8");

      console.log(`APPLY ${file}`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log(`OK ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`ERROR ${file}`);
        throw error;
      }
    }
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
