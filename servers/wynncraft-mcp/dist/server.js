import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatGuild, formatItem, formatPlayer, getGuild, getPlayer, searchItems, WynncraftError, } from "./api.js";
const text = (t) => ({ content: [{ type: "text", text: t }] });
const textError = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
export function createServer() {
    const server = new McpServer({
        name: "wynncraft-mcp",
        version: "1.0.0",
    });
    server.registerTool("get_player", {
        title: "Get player profile",
        description: "Get a Wynncraft player profile: rank, online status, guild, playtime, characters.",
        inputSchema: z.object({
            name: z.string().describe("Minecraft username, e.g. 'Salted'"),
        }),
        annotations: READ_ONLY,
    }, async ({ name }) => {
        try {
            return text(formatPlayer(await getPlayer(name)));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("get_guild", {
        title: "Get guild info",
        description: "Get a Wynncraft guild: level, territories, wars, member counts by rank.",
        inputSchema: z.object({
            name: z.string().describe("Guild name, e.g. 'Wynncraft'"),
        }),
        annotations: READ_ONLY,
    }, async ({ name }) => {
        try {
            return text(formatGuild(await getGuild(name)));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("search_items", {
        title: "Search items",
        description: "Search the Wynncraft item database by name: weapons, armour, accessories with tier and level requirement.",
        inputSchema: z.object({
            query: z.string().describe("Item name to search, e.g. 'discoverer'"),
            limit: z.number().int().min(1).max(20).default(5),
        }),
        annotations: READ_ONLY,
    }, async ({ query, limit }) => {
        try {
            const results = await searchItems(query, limit);
            if (results.length === 0)
                return text(`No Wynncraft items match "${query}".`);
            return text(`Wynncraft items for "${query}":\n\n${results.map((it, i) => formatItem(it, i)).join("\n")}`);
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    return server;
}
function errorMessage(e) {
    if (e instanceof WynncraftError)
        return `Error: ${e.message}`;
    if (e instanceof Error)
        return `Error: ${e.message}`;
    return `Error: ${String(e)}`;
}
