const BASE = 'https://registry.terraform.io/v1';

export interface ProviderArgs {
  namespace: string;
  name: string;
}

export interface ModuleArgs {
  namespace: string;
  name: string;
  provider: string;
}

export async function provider(args: ProviderArgs): Promise<string> {
  const ns = (args.namespace ?? '').trim();
  const name = (args.name ?? '').trim();
  if (!ns || !name) return 'Provide a namespace and provider name (like hashicorp aws).';
  const res = await fetch(`${BASE}/providers/${encodeURIComponent(ns)}/${encodeURIComponent(name)}`, {
    headers: { 'User-Agent': 'mrfentmen-terraform-registry-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Terraform registry returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const versions = (d.versions ?? []) as Array<Record<string, unknown>>;
  const latest = versions.filter((v) => v.version).slice(-1)[0];
  return [
    `Provider ${ns}/${name}`,
    latest?.version ? `Latest: ${String(latest.version)}` : '',
    s('description') ? `Desc: ${s('description').slice(0, 120)}` : '',
    s('downloads') ? `Downloads: ${s('downloads')}` : '',
  ].filter(Boolean).join('\n') || `No data for provider ${ns}/${name}.`;
}

export async function module(args: ModuleArgs): Promise<string> {
  const ns = (args.namespace ?? '').trim();
  const name = (args.name ?? '').trim();
  const providerName = (args.provider ?? '').trim();
  if (!ns || !name || !providerName) return 'Provide namespace, name, and provider (like terraform-aws-modules vpc aws).';
  const res = await fetch(`${BASE}/modules/${encodeURIComponent(ns)}/${encodeURIComponent(name)}/${encodeURIComponent(providerName)}`, {
    headers: { 'User-Agent': 'mrfentmen-terraform-registry-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Terraform registry returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `Module ${ns}/${name}/${providerName}`,
    s('version') ? `Latest: ${s('version')}` : '',
    s('description') ? `Desc: ${s('description').slice(0, 120)}` : '',
    s('downloads') ? `Downloads: ${s('downloads')}` : '',
    s('source') ? `Source: ${s('source')}` : '',
  ].filter(Boolean).join('\n') || `No data for module ${ns}/${name}/${providerName}.`;
}
