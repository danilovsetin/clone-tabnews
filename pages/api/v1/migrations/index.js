import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const migrationOptions = {
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method == "GET") {
    const pendingMigrations = await migrationRunner(migrationOptions);
    return response.status(200).json(pendingMigrations);
  }

  if (request.method == "POST") {
    const executedMigrations = await migrationRunner({
      ...migrationOptions,
      dryRun: false,
    });

    if (executedMigrations.length > 0) {
      return response.status(201).json(executedMigrations);
    }
    return response.status(200).json(executedMigrations);
  }

  return response.status(405).end();
}
