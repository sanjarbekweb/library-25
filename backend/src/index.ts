import { getEnv } from "./config/env";
import { createApp } from "./app";
import { disconnectDatabase } from "./utils/prisma";

const SHUTDOWN_DEADLINE_MS = 10_000;

const env = getEnv();
const server = createApp().listen(env.PORT, () => {
  console.log(JSON.stringify({ level: "info", msg: "backend listening", port: env.PORT }));
});

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ level: "info", msg: "shutting down", signal }));

  const force = setTimeout(() => {
    console.error(JSON.stringify({ level: "error", msg: "shutdown deadline exceeded; exiting" }));
    process.exit(1);
  }, SHUTDOWN_DEADLINE_MS);
  force.unref();

  server.close(() => {
    disconnectDatabase()
      .catch((error: unknown) => {
        console.error(JSON.stringify({ level: "error", msg: "database disconnect failed", error: String(error) }));
      })
      .finally(() => process.exit(0));
  });
  server.closeIdleConnections();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
