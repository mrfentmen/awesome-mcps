import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { m0_pluginInfo, m0_searchPlugins, m1_search } from './api.js';
const text = (value) => ({ content: [{ type: 'text', text: value }] });
const textError = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
const error = (e) => `Error: ${e instanceof Error ? e.message : String(e)}`;
const errorMessage = error;
export function createServer() {
    const server = new McpServer({ name: 'wordpress-mcp', version: '1.0.0' });
    server.registerTool("plugin_info", {
        title: "Plugin info",
        description: "Get details for a WordPress plugin.",
        inputSchema: z.object({ slug: z.string().describe("Plugin slug.") }),
        annotations: READ_ONLY,
    }, async (args) => {
        try {
            return text(await m0_pluginInfo(args));
        }
        catch (e) {
            return textError(error(e));
        }
    });
    server.registerTool("search_plugins", {
        title: "Search plugins",
        description: "Search plugins.",
        inputSchema: z.object({ query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
        annotations: READ_ONLY,
    }, async (args) => {
        try {
            return text(await m0_searchPlugins(args));
        }
        catch (e) {
            return textError(error(e));
        }
    });
    server.registerTool("search", {
        title: "Search",
        description: "Search WordPress themes.",
        inputSchema: z.object({ query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
        annotations: READ_ONLY,
    }, async (args) => {
        try {
            return text(await m1_search(args));
        }
        catch (e) {
            return textError(error(e));
        }
    });
    return server;
}
