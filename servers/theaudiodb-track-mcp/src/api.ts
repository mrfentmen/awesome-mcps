const BASE = 'https://www.theaudiodb.com/api/v1/json/2/track.php';

export interface TrackArgs {
  id: number;
}

export async function track(args: TrackArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide a numeric track ID.';
  const res = await fetch(`${BASE}?m=${id}`, {
    headers: { 'User-Agent': 'mrfentmen-theaudiodb-track-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TheAudioDB returned ${res.status}`);
  const data = (await res.json()) as { track?: Array<Record<string, unknown>> };
  const rows = data.track ?? [];
  if (!rows.length) return `No track found for ID ${id}.`;
  const t = rows[0];
  const str = (k: string) => (t[k] != null ? String(t[k]) : '');
  const parts = [
    str('strTrack'),
    str('strArtist') ? `by ${str('strArtist')}` : '',
    str('strAlbum') ? `album ${str('strAlbum')}` : '',
    str('intDuration') ? `${Math.round(Number(str('intDuration')) / 60)} min` : '',
  ].filter(Boolean);
  return parts.join(' | ') || `Track ${id}`;
}
