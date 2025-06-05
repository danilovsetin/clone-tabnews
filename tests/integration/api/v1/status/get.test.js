import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});
describe("GET /api/v1/status", () => {
  describe("Anonymous User", () => {
    test("Retrieving current system status", async () => {
      const result = await fetch("http://localhost:3000/api/v1/status");
      expect(result.status).toBe(200);

      //Testes propriedades
      const responseBody = await result.json();

      //updated_at
      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toBeDefined();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      //version
      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(responseBody.dependencies.database.version).toBe("16.0");

      //max_connections
      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(
        responseBody.dependencies.database.max_connections,
      ).toBeGreaterThan(0);
      expect(
        responseBody.dependencies.database.max_connections,
      ).toBeGreaterThanOrEqual(
        responseBody.dependencies.database.current_connections,
      );

      //current_connections
      expect(
        responseBody.dependencies.database.current_connections,
      ).toBeDefined();
      expect(
        responseBody.dependencies.database.current_connections,
      ).toBeLessThanOrEqual(responseBody.dependencies.database.max_connections);

      expect(responseBody.dependencies.database.current_connections).toEqual(1);
    });
  });
});
