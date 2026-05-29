import { requireAdmin, requireWriter } from "@/lib/firebase/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

function toError(err: unknown): string {
  if (err instanceof Error && err.message.startsWith("Unauthorized")) {
    return "You don't have permission to do that.";
  }
  return "Something went wrong. Please try again.";
}

// Run a mutation only for admins; uniform result + logging. Defense in depth —
// proxy is not trusted for writes, so every action re-checks the role.
export async function withAdmin(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await requireAdmin();
    await fn();
    return { ok: true };
  } catch (err) {
    console.error("[admin action]", err);
    return { ok: false, error: toError(err) };
  }
}

export async function withWriter(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await requireWriter();
    await fn();
    return { ok: true };
  } catch (err) {
    console.error("[admin action]", err);
    return { ok: false, error: toError(err) };
  }
}
