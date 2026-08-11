const UA = 'mrfentmen-mtg-mcp/1.0';

export interface CardsArgs {
  name: string;
  limit?: number;
}

export interface SetsArgs {
  limit?: number;
}

export async function cards(args: CardsArgs): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) return 'Provide a card name.';
  const limit = Math.min(Math.max(Number(args.limit ?? 5) || 5, 1), 20);
  const res = await fetch(`https://api.magicthegathering.io/v1/cards?name=${encodeURIComponent(name)}&pageSize=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`MTG API returned ${res.status}`);
  const d = (await res.json()) as { cards?: Array<{ name?: string; type?: string; manaCost?: string; rarity?: string; set?: string; power?: string; toughness?: string }> };
  const list = d.cards ?? [];
  if (!list.length) return `No MTG cards for "${name}".`;
  return `MTG cards for "${name}" (${list.length}):\n` +
    list.slice(0, limit).map((c, i) => `${i + 1}. ${c.name ?? '?'} (${c.rarity ?? '?'}, ${c.set ?? '?'}) | ${c.type ?? '?'} | cost: ${c.manaCost ?? 'none'} | P/T: ${c.power ?? '?'}/${c.toughness ?? '?'}`).join('\n');
}

export async function sets(args: SetsArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 50);
  const res = await fetch(`https://api.magicthegathering.io/v1/sets?pageSize=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`MTG API returned ${res.status}`);
  const d = (await res.json()) as { sets?: Array<{ code?: string; name?: string; type?: string; releaseDate?: string }> };
  const list = d.sets ?? [];
  if (!list.length) return 'No sets returned.';
  return `MTG sets (${list.length}):\n` +
    list.slice(0, limit).map((s, i) => `${i + 1}. [${s.code ?? '?'}] ${s.name ?? '?'} (${s.type ?? '?'}, released ${s.releaseDate ?? '?'})`).join('\n');
}
