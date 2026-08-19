import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de login inválidos.",
        action: "Verifique se as credenciais estão corretas",
      });
    }

    throw error;
  }

  async function findUserByEmail(email) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se este dado está correto",
        });
      }
      throw error;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const passwordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se as credenciais estão corretas",
      });
    }
  }

  return storedUser;
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
