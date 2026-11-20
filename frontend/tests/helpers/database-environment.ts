/** Validate isolation before importing services or constructing database clients. */
export function requireTestDatabase(environment: Readonly<Record<string, string | undefined>>): string {
  const fail = (): never => {
    throw new Error("Database tests require ALLOW_DATABASE_INTEGRATION_TESTS=true and an isolated TEST_DATABASE_URL with a test database name and an explicitly allowlisted host. Application and migration targets must differ.");
  };
  const parse = (value: string): URL => {
    try {
      const url = new URL(value);
      if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || url.search || url.hash) return fail();
      return url;
    } catch { return fail(); }
  };
  const name = (url: URL): string => {
    try { return decodeURIComponent(url.pathname.slice(1)); } catch { return fail(); }
  };
  if (environment.ALLOW_DATABASE_INTEGRATION_TESTS !== "true") return fail();
  const value = environment.TEST_DATABASE_URL?.trim();
  if (!value) return fail();
  const target = parse(value);
  const database = name(target);
  if (!/^[a-z0-9_]+_test$/.test(database)) return fail();
  const hosts = (environment.TEST_DATABASE_HOST_ALLOWLIST ?? "").split(",").map(host => host.trim().toLowerCase());
  if (!hosts.includes(target.hostname.toLowerCase())) return fail();
  for (const source of [environment.DATABASE_URL, environment.DIRECT_URL]) {
    if (!source?.trim()) continue;
    // Application URLs may contain provider options; do not echo them on failure.
    let application: URL;
    try { application = new URL(source); } catch { return fail(); }
    // Conservatively reject matching database names even across aliases/pooler ports.
    if (name(application) === database) return fail();
  }
  return value;
}
