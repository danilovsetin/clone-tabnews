import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

describe("DELETE /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Trying invalid delete method", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "DELETE",
      });
      expect(response1.status).toBe(405);

      const responseBody = await response1.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para esse endpoint",
        action:
          "Verifique se o método HTTP enviado é válido para esse endpoint.",
        status_code: 405,
      });
    });
  });
});
