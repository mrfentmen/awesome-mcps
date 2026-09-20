import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BandcampError, discover, formatItem } from "./api.js";
const text = (t) => ({ content: [{ type: "text", text: t }] });
const textError = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
export function createServer() {
    const server = new McpServer({
        name: "bandcamp-mcp",
        version: "1.0.0",
    });
    server.registerTool("discover", {
        title: "Discover music",
        description: "Discover trending or new albums and tracks on Bandcamp: titles, artists, genres, page links, preview streams.",
        inputSchema: z.object({
            sort: z.enum(["top", "new"]).default("top").describe("Trending now or new arrivals"),
            genre_id: z.number().int().min(0).default(0).describe("Numeric Bandcamp genre id, 0 = all genres"),
            page: z.number().int().min(0).max(20).default(0).describe("Result page, 0-based"),
            limit: z.number().int().min(1).max(20).default(5),
        }),
        annotations: READ_ONLY,
    }, async ({ sort, genre_id, page, limit }) => {
        try {
            const results = await discover(sort, genre_id, page, limit);
            if (results.length === 0)
                return text("No Bandcamp discoveries right now.");
            const label = sort === "new" ? "New arrivals" : "Trending now";
            return text(`Bandcamp ${label}:\n\n${results.map((it, i) => formatItem(it, i)).join("\n\n")}`);
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    return server;
}
function errorMessage(e) {
    if (e instanceof BandcampError)
        return `Error: ${e.message}`;
    if (e instanceof Error)
        return `Error: ${e.message}`;
    return `Error: ${String(e)}`;
}
