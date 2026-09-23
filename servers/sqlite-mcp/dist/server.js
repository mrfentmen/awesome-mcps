import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { describeTable, errorMessage, execute, listTables, query, } from "./api.js";
const text = (t) => ({ content: [{ type: "text", text: t }] });
const textError = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
const NON_READ_ONLY = { openWorldHint: true };
export function createServer(dbPath) {
    const server = new McpServer({
        name: "sqlite-mcp",
        version: "1.0.0",
    });
    server.registerTool("query", {
        title: "Run read query",
        description: "Run a read-only SELECT/WITH query with optional ? bound parameters.",
        inputSchema: z.object({
            sql: z.string().describe("SELECT statement, ? placeholders allowed"),
            params: z.array(z.string()).describe("Bound parameter values as strings").optional(),
        }),
        annotations: READ_ONLY,
    }, async ({ sql, params }) => {
        try {
            return text(await query(dbPath, sql, params));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("execute", {
        title: "Execute write statement",
        description: "Run INSERT/UPDATE/DELETE/DDL. Returns rows changed and last insert id.",
        inputSchema: z.object({
            sql: z.string().describe("Write statement, ? placeholders allowed"),
            params: z.array(z.string()).describe("Bound parameter values as strings").optional(),
        }),
        annotations: NON_READ_ONLY,
    }, async ({ sql, params }) => {
        try {
            return text(await execute(dbPath, sql, params));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("list_tables", {
        title: "List tables",
        description: "All tables and views with row counts.",
        inputSchema: z.object({}),
        annotations: READ_ONLY,
    }, async () => {
        try {
            return text(await listTables(dbPath));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    server.registerTool("describe_table", {
        title: "Describe table",
        description: "Columns, types, defaults, primary keys, and indexes for one table.",
        inputSchema: z.object({
            table: z.string().describe("Table name"),
        }),
        annotations: READ_ONLY,
    }, async ({ table }) => {
        try {
            return text(await describeTable(dbPath, table));
        }
        catch (e) {
            return textError(errorMessage(e));
        }
    });
    return server;
}
