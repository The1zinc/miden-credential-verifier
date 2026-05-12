import { neon } from "@neondatabase/serverless";

type SqlClient = ReturnType<typeof neon>;

let cachedSql: SqlClient | null = null;

function getSql(): SqlClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl === "your_neon_connection_string_here") {
    throw new Error("DATABASE_URL is not configured with a Neon connection string.");
  }

  cachedSql ??= neon(databaseUrl);
  return cachedSql;
}

const sql = ((strings: TemplateStringsArray, ...params: unknown[]) =>
  getSql()(strings, ...params)) as SqlClient;

export default sql;
