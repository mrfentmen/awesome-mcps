const BASE = 'https://api.nasa.gov/techport/api/projects';

export interface ProjectArgs {
  id: number;
}

export async function project(args: ProjectArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isInteger(id) || id <= 0) return 'Provide a positive TechPort project ID.';
  const res = await fetch(`${BASE}/${id}?api_key=DEMO_KEY`, {
    headers: { 'User-Agent': 'mrfentmen-nasa-techport-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NASA TechPort returned ${res.status}`);
  const data = (await res.json()) as {
    project?: {
      title?: string;
      description?: string;
      startDateString?: string;
      endDateString?: string;
      status?: string;
      website?: string;
      principalInvestigators?: Array<{ fullName?: string }>;
    };
  };
  const p = data.project;
  if (!p?.title) return `No TechPort project found with id ${id}.`;
  const lines = [
    `Title: ${p.title}`,
    `Status: ${p.status ?? 'n/a'}`,
    `Start: ${p.startDateString ?? 'n/a'}`,
    `End: ${p.endDateString ?? 'n/a'}`,
  ];
  const pis = (p.principalInvestigators ?? []).map((pi) => pi.fullName).filter(Boolean).join(', ');
  if (pis) lines.push(`Principal investigators: ${pis}`);
  if (p.description) lines.push(`\n${p.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400)}`);
  if (p.website) lines.push(`\nWebsite: ${p.website}`);
  return lines.join('\n');
}
