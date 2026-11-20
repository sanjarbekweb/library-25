/**
 * Fail-closed guard for database integration tests (ported from the frontend harness).
 * Requires an explicit opt-in, a URL without query overrides, a database name ending in
 * "_test", an allowlisted host, and a name different from the application database.
 */
export function requireTestDatabase(environment: Readonly<Record<string, string | undefined>>): string {
  const fail = (): never => {
    throw new Error(
      "Database tests require ALLOW_DATABASE_INTEGRATION_TESTS=true and an isolated TEST_DATABASE_URL " +
        "(database name ending in _test, no query string) whose host is listed in TEST_DATABASE_HOST_ALLOWLIST.",
    );
  };
  const parse = (value: string): URL => {
    try {
      const url = new URL(value);
      if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || url.search || url.hash) return fail();
      return url;
    } catch {
      return fail();
    }
  };
  const dbName = (url: URL) => decodeURIComponent(url.pathname.slice(1));

  if (environment.ALLOW_DATABASE_INTEGRATION_TESTS !== "true") return fail();
  const value = environment.TEST_DATABASE_URL?.trim();
  if (!value) return fail();
  const target = parse(value);
  if (!/^[a-z0-9_]+_test$/.test(dbName(target))) return fail();
  const hosts = (environment.TEST_DATABASE_HOST_ALLOWLIST ?? "").split(",").map((h) => h.trim().toLowerCase());
  if (!hosts.includes(target.hostname.toLowerCase())) return fail();
  for (const source of [environment.DATABASE_URL, environment.DIRECT_URL]) {
    if (!source?.trim()) continue;
    let application: URL;
    try {
      application = new URL(source);
    } catch {
      return fail();
    }
    if (dbName(application) === dbName(target)) return fail();
  }
  return value;
}
