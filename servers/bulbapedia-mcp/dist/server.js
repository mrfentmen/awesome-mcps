import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BulbapediaError, formatArticle, getArticle, randomArticle, searchArticles } from "./api.js";
const text = (t) => ({ content: [{ type: "text", text: t }] });
const textError = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
export function createServer() {
    const server = new McpServer({
        name: "bulbapedia-mcp",
        version: "1.0.0",
    });
    server.registerTool("search_articles", {
        title: "Search Bulbapedia",
        description: "Search Bulbapedia: Pokemon species, moves, abilities, characters, episodes, TCG sets.",
        inputSchema: z.object({
            query: z.string().describe("Search text, e.g. 'Pikachu', 'Thunderbolt move', 'Scarlet Violet'"),
            limit: z.number().int().min(1).max(20).default(5),
        }),
        annotations: READ_ONLY,
    }, async ({ query, limit }) => {
        try {
            const results = await searchArticles(query, limit);
            if (results.length === 0)
                return text(`No Bulbapedia articles match "${query}".`);
            return text(`Bulbapedia results for "${query}":\n\n${results.map((h, i) => `${i + 1}. ${h.title}${h.snippet ? ` — ${h.snippet.slice(0, 140)}` : ""}`).join("\n")}`);
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("get_article", {
        title: "Get article",
        description: "Get a Bulbapedia article summary: intro text plus wiki link.",
        inputSchema: z.object({
            title: z.string().describe("Exact article title, e.g. 'Pikachu (Pokémon)' (use search_articles to find it)"),
        }),
        annotations: READ_ONLY,
    }, async ({ title }) => {
        try {
            const a = await getArticle(title);
            if (!a)
                return text(`No Bulbapedia article titled "${title}".`);
            return text(formatArticle(a));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("random_article", {
        title: "Random article",
        description: "Open a random Bulbapedia article. Great for discovering obscure Pokemon and lore.",
        inputSchema: z.object({}),
        annotations: READ_ONLY,
    }, async () => {
        try {
            const { title } = await randomArticle();
            const a = await getArticle(title);
            if (!a)
                return text(`Random pick: ${title}`);
            return text(formatArticle(a));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    return server;
}
function errorMessage(e) {
    if (e instanceof BulbapediaError)
        return `Error: ${e.message}`;
    if (e instanceof Error)
        return `Error: ${e.message}`;
    return `Error: ${String(e)}`;
}
