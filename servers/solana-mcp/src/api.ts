const RPC = 'https://api.mainnet-beta.solana.com';

export interface SlotArgs {
  // No arguments needed.
}

export async function slot(_args: SlotArgs): Promise<string> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'mrfentmen-solana-mcp/1.0' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot' }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Solana returned ${res.status}`);
  const d = (await res.json()) as { result?: number; error?: { message?: string } };
  if (d.error) throw new Error(`Solana RPC error: ${d.error.message ?? 'unknown'}`);
  return `Current Solana slot: ${d.result ?? 'unknown'}`;
}
