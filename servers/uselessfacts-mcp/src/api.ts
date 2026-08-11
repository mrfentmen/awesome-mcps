const m0 = (() => {
const BASE = 'https://uselessfacts.jsph.pl/api/v2/facts';

async function fact(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/random`, {
    headers: { 'User-Agent': 'mrfentmen-uselessfacts-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Useless Facts returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  return `Useless fact: ${String(d.text ?? 'no fact')}`;
}

return { fact };
})();

const m1 = (() => {
const BASE = "https://uselessfacts.jsph.pl/api/v2/facts"
const UA = "mrfentmen-facts-mcp/1.0 (https://github.com/mrfentmen)"
class FactsError extends Error {}

async function randomFact(args: Record<string, never>): Promise<string> {
  const res = await fetch(`${BASE}/random`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new FactsError("UselessFacts rate limit hit, wait and retry")
  if (!res.ok) throw new FactsError(`UselessFacts error ${res.status}`)
  const d = (await res.json()) as any
  return d?.text ?? "No fact returned"
}

return { FactsError, randomFact };
})();

export const FactsError = m1.FactsError;
export const fact = m0.fact;
export const randomFact = m1.randomFact;
export const m0_fact = m0.fact;
export const m1_FactsError = m1.FactsError;
export const m1_randomFact = m1.randomFact;
