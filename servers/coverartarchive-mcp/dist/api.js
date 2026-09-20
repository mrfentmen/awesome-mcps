/**
 * Cover Art Archive client, keyless.
 * Look up artwork for a MusicBrainz release or release-group MBID.
 * Docs: https://musicbrainz.org/doc/Cover_Art_Archive/API
 */
const BASE = "https://coverartarchive.org";
export class CoverArtError extends Error {
}
const MBID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function fetchJson(url) {
    const res = await fetch(url, {
        headers: { "User-Agent": "coverartarchive-mcp/1.0", Accept: "application/json" },
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
    });
    if (res.status === 404)
        throw new CoverArtError("No cover art archived for this MBID yet.");
    if (!res.ok)
        throw new CoverArtError(`Cover Art Archive error ${res.status}`);
    return (await res.json());
}
export async function getCover(mbid, kind) {
    const clean = mbid.trim().toLowerCase();
    if (!MBID.test(clean))
        throw new CoverArtError(`Not a valid MBID: "${mbid}". Find one with musicbrainz-mcp first.`);
    const data = await fetchJson(`${BASE}/${kind}/${clean}/`);
    const images = Array.isArray(data.images) ? data.images : [];
    const front = images.find((i) => i.front === true);
    const back = images.find((i) => i.back === true);
    return {
        mbid: clean,
        kind,
        front: front?.image,
        frontThumb: front?.thumbnails?.["500"] ?? front?.thumbnails?.small,
        back: back?.image,
        imageCount: images.length,
        allImages: images.map((i) => String(i.image)).slice(0, 10),
    };
}
export function frontUrl(mbid, kind, size = 500) {
    return `${BASE}/${kind}/${mbid.trim().toLowerCase()}/front-${size}`;
}
export function formatCover(c) {
    const lines = [
        `Cover art for ${c.kind} ${c.mbid} (${c.imageCount} image${c.imageCount === 1 ? "" : "s"} archived)`,
        c.front ? `Front: ${c.front}` : "No front cover archived.",
        c.frontThumb ? `Front thumbnail: ${c.frontThumb}` : "",
        c.back ? `Back: ${c.back}` : "",
        c.allImages.length > 1 ? `All images:\n- ${c.allImages.join("\n- ")}` : "",
    ].filter(Boolean);
    return lines.join("\n");
}
