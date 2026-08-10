const BASE = 'https://api.ipify.org?format=json';

export async function myip(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-ipify-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`ipify returned ${res.status}`);
  const data = (await res.json()) as { ip?: string };
  if (!data.ip) throw new Error('ipify returned an empty response');
  return `Your public IP address is ${data.ip}`;
}
