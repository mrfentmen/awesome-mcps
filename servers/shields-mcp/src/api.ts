const BASE = 'https://img.shields.io/badge';

export interface BadgeArgs {
  label: string;
  message: string;
  color?: string;
}

export async function badge(args: BadgeArgs): Promise<string> {
  const label = (args.label ?? '').trim();
  const message = (args.message ?? '').trim();
  if (!label || !message) return 'Provide both a label and a message.';
  const color = (args.color ?? 'green').trim();
  const safe = (s: string): string => s.replace(/[^a-zA-Z0-9-_.]+/g, '_');
  return `${BASE}/${safe(label)}-${safe(message)}-${safe(color)}.svg`;
}
