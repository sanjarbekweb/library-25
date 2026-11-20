/** Message of a thrown value, or "" when it is not an Error. Used to match repository sentinel errors. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "";
}
