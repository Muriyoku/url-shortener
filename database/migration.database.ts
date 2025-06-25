import { db } from "./config.database";
import { sql } from "bun";

await db.connect()

await sql`
  CREATE TABLE IF NOT EXISTS url_shortner (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    long_url VARCHAR(2048) NOT NULL UNIQUE,
    short_url VARCHAR(20) NOT NULL UNIQUE,
    clicks INTEGER NOT NULL DEFAULT 0
  )
`;
