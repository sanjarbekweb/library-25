import "./setup-env";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../src/app";
import { disconnectDatabase } from "../src/utils/prisma";

let server: Server;
let base: string;

before(async () => {
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await disconnectDatabase();
});

test("liveness does not depend on the database", async () => {
  const res = await fetch(`${base}/api/health/live`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("readiness reports 503 when the database is unreachable", async () => {
  const res = await fetch(`${base}/api/health/ready`);
  assert.equal(res.status, 503);
  assert.equal((await res.json()).dependency, "database");
});

test("every response carries a request id, and a well-formed inbound id is reused", async () => {
  const generated = await fetch(`${base}/api/health/live`);
  assert.match(generated.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/);
  const reused = await fetch(`${base}/api/health/live`, { headers: { "X-Request-Id": "trace-12345678" } });
  assert.equal(reused.headers.get("x-request-id"), "trace-12345678");
  const rejected = await fetch(`${base}/api/health/live`, { headers: { "X-Request-Id": "bad id <script>" } });
  assert.notEqual(rejected.headers.get("x-request-id"), "bad id <script>");
});

test("protected routes return 401 UNAUTHENTICATED without a session token", async () => {
  for (const path of ["/api/v1/users/me", "/api/v1/reservations/my", "/api/v1/analytics"]) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.status, 401, path);
    assert.equal((await res.json()).error.code, "UNAUTHENTICATED", path);
  }
});

test("unknown routes return a JSON 404", async () => {
  const res = await fetch(`${base}/api/v1/does-not-exist`);
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error.code, "ROUTE_NOT_FOUND");
});

test("malformed JSON bodies return 400 instead of 500", async () => {
  const res = await fetch(`${base}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, "invalid_json");
});

test("CORS allows the configured origin only", async () => {
  const allowed = await fetch(`${base}/api/health/live`, { headers: { Origin: "http://localhost:3000" } });
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:3000");
  const denied = await fetch(`${base}/api/health/live`, { headers: { Origin: "http://evil.example" } });
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
});

test("the framework fingerprint header is not sent", async () => {
  const res = await fetch(`${base}/api/health/live`);
  assert.equal(res.headers.get("x-powered-by"), null);
});
