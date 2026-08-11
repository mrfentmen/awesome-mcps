const UA = 'mrfentmen-mcstatus-mcp/1.0';

export interface StatusArgs {
  host: string;
  port?: number;
}

export async function status(args: StatusArgs): Promise<string> {
  const host = String(args.host).trim();
  if (!host) throw new Error('Provide a server host.');
  const port = Math.min(Math.max(Number(args?.port ?? 25565) || 25565, 1), 65535);
  const suffix = port === 25565 ? '' : `/${port}`;
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(host)}${suffix}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`mcstatus.io returned ${res.status}`);
  const d = (await res.json()) as {
    online?: boolean; host?: string; port?: number; ip_address?: string; eula_blocked?: boolean;
    version?: { name_raw?: string; name_clean?: string }; players?: { online?: number; max?: number; list?: Array<{ name_clean?: string }> };
    motd?: { clean?: string[] | string }; icon?: string;
  };
  if (d.online == null) throw new Error('No status returned.');
  if (!d.online) return `Minecraft server ${host}:${port} is OFFLINE.\nIP: ${d.ip_address ?? '?'}`;
  const sample = (d.players?.list ?? []).slice(0, 8).map((p) => p.name_clean ?? '?').join(', ');
  const motdClean = Array.isArray(d.motd?.clean) ? d.motd.clean.join(' ') : (d.motd?.clean as string | undefined) ?? '';
  return `Minecraft server ${host}:${port} is ONLINE.\nVersion: ${d.version?.name_clean ?? d.version?.name_raw ?? '?'}\nPlayers: ${d.players?.online ?? 0}/${d.players?.max ?? 0}${sample ? `\nOnline: ${sample}` : ''}\nMOTD: ${motdClean.trim().slice(0, 150) || 'none'}\nIP: ${d.ip_address ?? '?'}`;
}
