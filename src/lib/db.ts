import postgres from "postgres";

let sqlClient: postgres.Sql | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlClient) {
    sqlClient = postgres(databaseUrl, {
      max: 1,
      ssl: databaseUrl.includes("localhost") ? "prefer" : "require",
    });
  }

  return sqlClient;
}
