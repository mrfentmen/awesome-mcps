import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatComic, getComic, latestComic, XkcdError } from "./api.js";
const text = (t) => ({ content: [{ type: "text", text: t }] });
const textError = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
export function createServer() {
    const server = new McpServer({
        name: "xkcd-mcp",
        version: "1.0.0",
    });
    server.registerTool("latest_comic", {
        title: "Latest comic",
        description: "Get the newest xkcd comic.",
        inputSchema: z.object({}),
        annotations: READ_ONLY,
    }, async () => {
        try {
            return text(formatComic(await latestComic()));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("get_comic", {
        title: "Get comic",
        description: "Get an xkcd comic by number.",
        inputSchema: z.object({ num: z.number().int().min(1).describe("Comic number, e.g. 200") }),
        annotations: READ_ONLY,
    }, async ({ num }) => {
        try {
            return text(formatComic(await getComic(num)));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    return server;
}
function errorMessage(e) {
    if (e instanceof XkcdError)
        return `Error: ${e.message}`;
    if (e instanceof Error)
        return `Error: ${e.message}`;
    return `Error: ${String(e)}`;
}
