import database from "../../../../infra/database.js";
async function status(request, response) {
  const result = await database.query("SELECT 1+1 AS Rows;");
  console.log(result.rows);
  response.status(200).send("teste");
}

export default status;
