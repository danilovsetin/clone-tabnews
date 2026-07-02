import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    test("With nonexisting 'username'", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/usuarioInexistente",
        {
          method: "PATCH",
        },
      );

      expect(response2.status).toBe(404);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o nome de usuário e tente novamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O nome de usuário informado já está em uso.",
        action: "Utilize outro nome de usuário para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@test.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@test.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@test.com",
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O e-mail informado já está em uso.",
        action: "Utilize outro e-mail para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser1 = await orchestrator.createUser({
        username: "uniqueUser1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: createdUser1.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser1 = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@test.com",
          }),
        },
      );

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser1.username,
        email: "uniqueEmail2@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser1 = await orchestrator.createUser({
        password: "password123",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword123",
          }),
        },
      );

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser1.username,
        email: createdUser1.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        createdUser1.username,
      );
      const correctPasswordMatch = await password.compare(
        "newPassword123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
