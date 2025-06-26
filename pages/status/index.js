import useSWR from "swr";

async function fetchAPI(url) {
  const result = await fetch(url);
  const responseBody = await result.json();
  return responseBody;
}

export default function StatusPage() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 10000,
  });

  if (!data) return null;
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <UpdatedAt updatedAt={data.updated_at} />
      <DatabaseStatus database={data.dependencies.database} />
    </>
  );
}

function UpdatedAt({ updatedAt }) {
  const updatedAtformatted = new Date(updatedAt).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div>
      <h1>Status</h1>
      <div>Last updated at: {updatedAtformatted}</div>
    </div>
  );
}

function DatabaseStatus({ database }) {
  return (
    <div>
      <h2>Database Status</h2>
      <div>Version: {database.version}</div>
      <div>Max Connections: {database.max_connections}</div>
      <div>Current Connections: {database.current_connections}</div>
    </div>
  );
}
