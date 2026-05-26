/**
 * Resilient client-side wrapper for POST /api/orders.
 *
 * Why this exists: the order-creation endpoint is the LAST thing that runs
 * during a checkout. Cold-starting the Vercel function + opening the libsql
 * connection on first hit can intermittently fail (timeout, 5xx). Without a
 * retry, the buyer's mock payment "succeeds" but the order doesn't persist —
 * they see "Payment Failed" and the merchant never sees the order. Retrying
 * 2–3x with backoff makes that race virtually invisible.
 *
 * Safety: we never retry on 4xx (validation errors won't change between
 * attempts). We retry on network errors and 5xx.
 *
 * Idempotency: the buyer hitting "Pay" once should produce at most one order
 * row. We can't fully guarantee that without an idempotency key on the server
 * (a future enhancement), but in practice the retry only fires when the first
 * attempt produced no successful response, so duplicates are rare. If a few
 * appear, the merchant can cancel them from the dashboard.
 */

export interface PostOrderResult {
  ok: true;
  reference?: string;
  id?: string;
  status?: string;
}

export interface PostOrderFailure {
  ok: false;
  status?: number;
  error: string;
}

export async function postOrder(
  body: Record<string, unknown>,
  opts: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<PostOrderResult | PostOrderFailure> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 600;

  let lastErr: { status?: number; error: string } | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = (await res.json()) as { id?: string; reference?: string; status?: string };
        return { ok: true, ...data };
      }

      // Bad request — won't get better on retry.
      if (res.status >= 400 && res.status < 500) {
        let serverError = `HTTP ${res.status}`;
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) serverError = data.error;
        } catch { /* body wasn't JSON */ }
        return { ok: false, status: res.status, error: serverError };
      }

      // 5xx — retry.
      lastErr = { status: res.status, error: `Server returned ${res.status}` };
    } catch (err) {
      // Network error / fetch threw — retry.
      lastErr = { error: err instanceof Error ? err.message : 'Network error' };
    }

    if (attempt < maxAttempts) {
      // Exponential backoff: 600ms, 1200ms, 2400ms, ...
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  return { ok: false, ...lastErr! };
}
