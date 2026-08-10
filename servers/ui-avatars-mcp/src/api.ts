const BASE = 'https://ui-avatars.com/api/';

export interface AvatarArgs {
  name: string;
  size?: number;
}

export async function avatar(args: AvatarArgs): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) return 'Provide a name or initials.';
  const size = Math.min(Math.max(Number(args.size ?? 128) || 128, 16), 512);
  const url = `${BASE}?name=${encodeURIComponent(name)}&size=${size}`;
  // Verify the avatar endpoint responds.
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-ui-avatars-mcp/1.0', Accept: 'image/png' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`UI Avatars returned ${res.status}`);
  return [
    `UI Avatar for "${name}":`,
    `URL: ${url}`,
    `Size: ${size}x${size}px (PNG)`,
  ].join('\n');
}
