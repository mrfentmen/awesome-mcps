const BASE = 'https://www.theaudiodb.com/api/v1/json/2';

export interface ArtistArgs {
  name: string;
}

export interface AlbumArgs {
  artist: string;
}

export async function artist(args: ArtistArgs): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) return 'Provide an artist name.';
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(name)}`, {
    headers: { 'User-Agent': 'mrfentmen-theaudiodb-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TheAudioDB returned ${res.status}`);
  const data = (await res.json()) as { artists?: Array<Record<string, unknown>> | null };
  const artists = (data.artists ?? []).slice(0, 5);
  if (!artists.length) return `No artist found for "${name}".`;
  return `Artists matching "${name}":\n` +
    artists
      .map((a, i) => {
        const formed = a.strFormedYear ? ` | formed ${a.strFormedYear}` : '';
        const genre = a.strGenre ? ` | ${a.strGenre}` : '';
        return `${i + 1}. ${a.strArtist ?? 'unknown'}${genre}${formed}\n   ${a.strBiographyEN ? String(a.strBiographyEN).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180) : ''}`;
      })
      .join('\n');
}

export async function album(args: AlbumArgs): Promise<string> {
  const artistName = (args.artist ?? '').trim();
  if (!artistName) return 'Provide an artist name.';
  const res = await fetch(`${BASE}/searchalbum.php?s=${encodeURIComponent(artistName)}`, {
    headers: { 'User-Agent': 'mrfentmen-theaudiodb-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TheAudioDB returned ${res.status}`);
  const data = (await res.json()) as { album?: Array<Record<string, unknown>> | null };
  const albums = (data.album ?? []).slice(0, 20);
  if (!albums.length) return `No albums found for "${artistName}".`;
  return `Albums by ${artistName} (${albums.length} shown):\n` +
    albums
      .map((a, i) => `${i + 1}. ${a.strAlbum ?? 'untitled'} (${a.intYearReleased ?? a.intYearFormed ?? ''})`)
      .join('\n');
}
