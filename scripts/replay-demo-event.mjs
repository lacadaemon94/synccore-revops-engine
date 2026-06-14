import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const scriptArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const [filePath] = scriptArgs;

if (!filePath) {
  console.error("Usage: node scripts/replay-demo-event.mjs <path-to-json-event>");
  process.exit(1);
}

const endpoint = process.env.SYNC_CORE_INGEST_URL ?? "http://localhost:3000/api/events/ingest";
const absolutePath = resolve(process.cwd(), filePath);

try {
  const payload = JSON.parse(await readFile(absolutePath, "utf8"));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json();

  console.log(
    JSON.stringify(
      {
        endpoint,
        file: absolutePath,
        status: response.status,
        ok: response.ok,
        response: body
      },
      null,
      2
    )
  );

  if (!response.ok) {
    process.exit(1);
  }
} catch (error) {
  console.error(
    JSON.stringify(
      {
        endpoint,
        file: absolutePath,
        error: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );
  process.exit(1);
}
