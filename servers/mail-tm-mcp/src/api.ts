const UA = 'mrfentmen-mail-tm-mcp/1.0';

export async function domains(_args?: unknown): Promise<string> {
  const res = await fetch('https://api.mail.tm/domains', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Mail.tm returned ${res.status}`);
  const d = (await res.json()) as Array<{ domain?: string; isActive?: boolean }>;
  const list = Array.isArray(d) ? d : [];
  if (!list.length) return 'No domains returned.';
  return `Mail.tm available domains (${list.length}):\n` +
    list.map((x, i) => `${i + 1}. ${x.domain ?? '?'}${x.isActive ? ' (active)' : ''}`).join('\n');
}
