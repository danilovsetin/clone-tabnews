import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller.js";
import { error } from "node:console";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const rsVersion = await database.query("SHOW server_version;");
  const rsMaxConn = await database.query("SHOW max_connections;");

  const databaseName = process.env.POSTGRES_DB;
  const rsCurrentConn = await database.query({
    text: "SELECT COUNT(*)::int AS current_connections FROM pg_stat_activity WHERE datname= $1 ;",
    values: [databaseName],
  });

  const updatedAt = new Date().toISOString();
  const version = rsVersion.rows[0].server_version ?? "";
  const maxConnections = rsMaxConn.rows[0].max_connections ?? 0;
  const currentConnections = rsCurrentConn.rows[0].current_connections ?? 0;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        current_connections: currentConnections,
      },
    },
  });
}
