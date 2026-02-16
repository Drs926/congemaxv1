import { readFile } from "node:fs/promises";
import path from "node:path";
import { closeDb, getDb } from "../db/client.js";

const run = async (): Promise<void> => {
  const db = getDb();
  try {
    const jsonPath = path.resolve(
      process.cwd(),
      "src/conventions/idcc_1801.v1.json",
    );
    const raw = await readFile(jsonPath, "utf8");
    const data = JSON.parse(raw);

    await db.query(
      `insert into conventions(code, data, version)
       values ('IDCC_1801', $1::jsonb, 1)
       on conflict (code)
       do update
         set data = excluded.data,
             version = excluded.version,
             updated_at = now()`,
      [JSON.stringify(data)],
    );

    console.log("SEEDED IDCC_1801 v1");
  } finally {
    await closeDb();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
