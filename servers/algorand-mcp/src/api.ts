const BASE = 'https://mainnet-api.algonode.cloud/v2/status';

export interface StatusArgs {
  // No arguments needed.
}

export async function status(_args: StatusArgs): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-algorand-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Algorand returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `Round: ${s('last-round')}`,
    `Synced: ${s('catchup-time') === '0' ? 'yes' : s('catchup-time')}`,
    `Version: ${s('version')}`,
  ].filter((l) => !l.endsWith(': ')).join('\n') || 'No status data returned.';
}
