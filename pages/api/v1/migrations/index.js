import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const migrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method == "GET") {
    const pendingMigrations = await migrationRunner(migrationOptions);
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method == "POST") {
    const executedMigrations = await migrationRunner({
      ...migrationOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (executedMigrations.length > 0) {
      return response.status(201).json(executedMigrations);
    }
    return response.status(200).json(executedMigrations);
  }

  return response.status(405).end();
}
