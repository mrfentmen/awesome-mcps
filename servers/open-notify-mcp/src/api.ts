const UA = 'mrfentmen-open-notify-mcp/1.0';

export async function astronauts(_args?: unknown): Promise<string> {
  const res = await fetch('http://api.open-notify.org/astros.json', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Open Notify returned ${res.status}`);
  const d = (await res.json()) as { number?: number; people?: Array<{ craft?: string; name?: string }> };
  const people = d.people ?? [];
  return `People in space right now (${d.number ?? people.length}):\n` +
    people.map((p, i) => `${i + 1}. ${p.name ?? '?'} (${p.craft ?? '?'})`).join('\n');
}

export async function iss(_args?: unknown): Promise<string> {
  const res = await fetch('http://api.open-notify.org/iss-now.json', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Open Notify returned ${res.status}`);
  const d = (await res.json()) as { iss_position?: { latitude?: string; longitude?: string }; timestamp?: number };
  const pos = d.iss_position ?? {};
  const when = d.timestamp ? new Date(d.timestamp * 1000).toISOString() : '?';
  return `ISS position at ${when}:\nLatitude: ${pos.latitude ?? '?'}\nLongitude: ${pos.longitude ?? '?'}`;
}
