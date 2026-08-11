const UA = 'mrfentmen-runescape-mcp/1.0';

export interface HiscoreArgs {
  player: string;
}

export async function hiscore(args: HiscoreArgs): Promise<string> {
  const player = (args.player ?? '').trim();
  if (!player) return 'Provide a player name.';
  const url = `https://secure.runescape.com/m=hiscore/index_lite.ws?player=${encodeURIComponent(player)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/plain' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`RuneScape returned ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);
  if (!lines.length) return `No hiscore data for ${player}.`;
  const skills = ['Overall', 'Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering', 'Divination', 'Invention', 'Archaeology', 'Necromancy'];
  const rows = lines.slice(0, 30).map((l, i) => {
    const parts = l.split(',');
    const rank = parts[0];
    const level = parts[1];
    const xp = parts[2];
    const name = skills[i] ?? `Skill ${i}`;
    return `${name}: level ${level ?? '?'} (xp ${xp ?? '?'}, rank ${rank ?? '?'})`;
  });
  return `RuneScape 3 hiscore for ${player}:\n${rows.join('\n')}`;
}
