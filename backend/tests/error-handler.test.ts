import "./setup-env";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { mapPrismaError } from "../src/middlewares/errorHandler";

const known = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("db error", { code, clientVersion: "test" });

test("unique-index races map to 409 conflicts", () => {
  assert.equal(mapPrismaError(known("P2002"))?.status, 409);
  assert.equal(mapPrismaError(known("P2034"))?.status, 409);
});

test("missing records map to 404 and pool exhaustion to 503", () => {
  assert.equal(mapPrismaError(known("P2025"))?.status, 404);
  assert.equal(mapPrismaError(known("P2024"))?.status, 503);
});

test("unmapped and non-Prisma errors are left for the generic 500 path", () => {
  assert.equal(mapPrismaError(known("P2003")), undefined);
  assert.equal(mapPrismaError(new Error("boom")), undefined);
});
