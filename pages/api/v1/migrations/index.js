import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { createRouter } from "next-connect";
import controller from "infra/controller.js";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

function getMigrationOptions(dbClient) {
  return {
    dbClient: dbClient,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

async function postHandler(request, response) {
  const dbClient = await database.getNewClient();
  try {
    const migrationOptions = getMigrationOptions(dbClient);
    const executedMigrations = await migrationRunner({
      ...migrationOptions,
      dryRun: false,
    });
    if (executedMigrations.length > 0) {
      return response.status(201).json(executedMigrations);
    }
    return response.status(200).json(executedMigrations);
  } finally {
    await dbClient.end();
  }
}

async function getHandler(request, response) {
  const dbClient = await database.getNewClient();
  try {
    const migrationOptions = getMigrationOptions(dbClient);

    const pendingMigrations = await migrationRunner(migrationOptions);
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}
