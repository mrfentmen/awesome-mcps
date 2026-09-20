import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DemozooError, formatProduction, formatReleaser, formatSummary, getProduction, getReleaser, searchProductions, } from "./api.js";
const text = (t) => ({ content: [{ type: "text", text: t }] });
const textError = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
export function createServer() {
    const server = new McpServer({
        name: "demozoo-mcp",
        version: "1.0.0",
    });
    server.registerTool("search_productions", {
        title: "Search demoscene productions",
        description: "Search Demozoo for demoscene productions: demos, intros, graphics, music. Finds titles across 390k+ entries.",
        inputSchema: z.object({
            query: z.string().describe("Search text, e.g. 'second reality', 'farbrausch', 'amiga cracktro'"),
            limit: z.number().int().min(1).max(20).default(5),
        }),
        annotations: READ_ONLY,
    }, async ({ query, limit }) => {
        try {
            const results = await searchProductions(query, limit);
            if (results.length === 0)
                return text(`No Demozoo productions match "${query}".`);
            return text(`Demozoo results for "${query}":\n\n${results.map((p, i) => formatSummary(p, i)).join("\n")}`);
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("get_production", {
        title: "Get production details",
        description: "Get a Demozoo production by id: authors, release date, platforms, credits, and download links.",
        inputSchema: z.object({
            id: z.string().describe("Numeric Demozoo production id, e.g. '1' (use search_productions to find it)"),
        }),
        annotations: READ_ONLY,
    }, async ({ id }) => {
        try {
            const p = await getProduction(id);
            if (!p)
                return text(`No Demozoo production with id ${id}.`);
            return text(formatProduction(p));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("get_releaser", {
        title: "Get group or scener profile",
        description: "Get a Demozoo group or scener profile by id: nicks, group memberships, members.",
        inputSchema: z.object({
            id: z.string().describe("Numeric Demozoo releaser id, e.g. '16685' (shown in production credits)"),
        }),
        annotations: READ_ONLY,
    }, async ({ id }) => {
        try {
            const r = await getReleaser(id);
            if (!r)
                return text(`No Demozoo group/scener with id ${id}.`);
            return text(formatReleaser(r));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    return server;
}
function errorMessage(e) {
    if (e instanceof DemozooError)
        return `Error: ${e.message}`;
    if (e instanceof Error)
        return `Error: ${e.message}`;
    return `Error: ${String(e)}`;
}
