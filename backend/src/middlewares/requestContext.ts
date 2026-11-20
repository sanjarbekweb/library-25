import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,128}$/;

/** Assigns a request ID (reusing a well-formed inbound X-Request-Id) and logs one line per response. */
export function requestContext(req: Request, res: Response, next: NextFunction) {
  const inbound = req.header("x-request-id");
  const requestId = inbound && REQUEST_ID_PATTERN.test(inbound) ? inbound : randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const started = process.hrtime.bigint();
  res.on("finish", () => {
    if (process.env.NODE_ENV === "test") return;
    const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
    const entry = {
      level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
      msg: "request",
      requestId,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
      userId: req.user?.id,
    };
    console.log(JSON.stringify(entry));
  });

  next();
}
