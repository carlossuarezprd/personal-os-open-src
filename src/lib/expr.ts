import { evaluate } from 'mathjs';

export type EvalResult =
  | { ok: true; value: number }
  | { ok: false };

/**
 * Safely evaluate a numeric expression string.
 * Returns { ok: true, value } if parseable, { ok: false } otherwise.
 * Never uses eval(). Uses mathjs evaluate() which is sandboxed.
 */
export function evalExpr(raw: string): EvalResult {
  const s = raw.trim();
  if (s === '' || s === '-' || s === '.') return { ok: false };

  // Plain number fast path
  const n = Number(s);
  if (!isNaN(n) && s !== '') return { ok: true, value: n };

  // Only allow if it contains arithmetic operators — avoid evaluating arbitrary expressions
  if (!/[+\-*/()]/.test(s)) return { ok: false };

  try {
    const result = evaluate(s);
    if (typeof result === 'number' && isFinite(result)) {
      return { ok: true, value: result };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}
