/**
 * gPodder directory API client, keyless.
 * Docs: https://gpoddernet.readthedocs.io/en/latest/api/
 */
const BASE = "https://gpodder.net";
export class GpodderError extends Error {
}
async function getJson(path) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "User-Agent": "gpodder-mcp/1.0" },
        signal: AbortSignal.timeout(15000),
    });
    if (!res.ok)
        throw new GpodderError(`gPodder error ${res.status}`);
    return (await res.json());
}
const toPodcast = (p) => ({
    title: String(p.title ?? "?"),
    author: p.author || undefined,
    feed: p.url || undefined,
    description: p.description ? String(p.description).replace(/\s+/g, " ").trim().slice(0, 160) : undefined,
    subscribers: typeof p.subscribers === "number" ? p.subscribers : undefined,
    logo: p.scaled_logo_url || p.logo_url || undefined,
});
export async function searchPodcasts(query, limit = 5) {
    const rows = await getJson(`/search.json?q=${encodeURIComponent(query)}`);
    return rows.slice(0, limit).map(toPodcast);
}
export async function topPodcasts(limit = 10) {
    const rows = await getJson(`/toplist/${Math.min(Math.max(limit, 1), 100)}.json`);
    return rows.slice(0, limit).map(toPodcast);
}
export async function listTags(limit = 20) {
    const rows = await getJson(`/api/2/tags/${Math.min(Math.max(limit, 1), 100)}.json`);
    return rows.slice(0, limit).map((t) => ({
        tag: String(t.tag ?? "?"),
        title: t.title || undefined,
        usage: typeof t.usage === "number" ? t.usage : undefined,
    }));
}
export async function podcastsByTag(tag, limit = 10) {
    const rows = await getJson(`/api/2/tag/${encodeURIComponent(tag)}/${Math.min(Math.max(limit, 1), 100)}.json`);
    return rows.slice(0, limit).map(toPodcast);
}
export function formatPodcast(p, index) {
    const prefix = index !== undefined ? `${index + 1}. ` : "";
    const lines = [
        `${prefix}${p.title}${p.author ? ` — ${p.author}` : ""}${p.subscribers !== undefined ? ` (${p.subscribers} subs)` : ""}`,
        p.description ? `${p.description}` : "",
        p.feed ? `Feed: ${p.feed}` : "",
    ].filter(Boolean);
    return lines.join("\n");
}
