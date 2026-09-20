/**
 * Bandcamp discovery API client, keyless.
 * Uses the same get_web endpoint the Bandcamp Discover page uses.
 */
const API = "https://bandcamp.com/api/discover/3/get_web";
export class BandcampError extends Error {
}
function itemUrl(hints) {
    if (!hints)
        return undefined;
    const sub = hints.subdomain;
    const slug = hints.slug;
    const type = hints.item_type === "t" ? "track" : "album";
    if (!sub || !slug)
        return undefined;
    return `https://${sub}.bandcamp.com/${type}/${slug}`;
}
export async function discover(sort = "top", genreId = 0, page = 0, limit = 5) {
    const res = await fetch(API, {
        method: "POST",
        headers: { "User-Agent": "bandcamp-mcp/1.0", "Content-Type": "application/json" },
        body: JSON.stringify({ g: "all", s: sort, p: page, gn: genreId, f: "all", w: 0 }),
        signal: AbortSignal.timeout(20000),
    });
    if (!res.ok)
        throw new BandcampError(`Bandcamp error ${res.status}`);
    const data = (await res.json());
    const items = Array.isArray(data.items) ? data.items : [];
    return items.slice(0, limit).map((it) => {
        const feat = (it.featured_track ?? {});
        const file = (feat.file ?? {});
        return {
            kind: it.type === "t" ? "track" : "album",
            title: String(it.primary_text ?? "?"),
            artist: String(it.secondary_text ?? "?"),
            genre: it.genre_text,
            location: it.location_text,
            publishDate: it.publish_date ? String(it.publish_date) : undefined,
            url: itemUrl(it.url_hints),
            featuredTrack: feat.title ? String(feat.title) : undefined,
            trackDuration: typeof feat.duration === "number" ? Math.round(feat.duration) : undefined,
            streamUrl: typeof file["mp3-128"] === "string" ? String(file["mp3-128"]) : undefined,
        };
    });
}
const fmtDur = (s) => s === undefined ? "" : ` (${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")})`;
export function formatItem(it, index) {
    const prefix = index !== undefined ? `${index + 1}. ` : "";
    const lines = [
        `${prefix}[${it.kind}] ${it.title} — ${it.artist}${it.genre ? ` (${it.genre})` : ""}`,
        it.publishDate ? `Released: ${it.publishDate}` : "",
        it.location ? `From: ${it.location}` : "",
        it.featuredTrack ? `Featured: ${it.featuredTrack}${fmtDur(it.trackDuration)}` : "",
        it.url ? `Page: ${it.url}` : "",
        it.streamUrl ? `Preview: ${it.streamUrl}` : "",
    ].filter(Boolean);
    return lines.join("\n");
}
