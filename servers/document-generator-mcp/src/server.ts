import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createDoc } from "./api.js"
import { createReport } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "document-generator-mcp", version: "1.0.0" })
  server.registerTool(
    "create_doc",
    {
      title: "Create doc",
      description: "Create a Word document with a title and paragraphs.",
      inputSchema: z.object( { title: z.string().describe("Document title."), body: z.string().describe("Body paragraphs separated by blank lines."), filename: z.string().describe("Output file name.").optional() }),
      annotations: WRITE,
    },
    async (args) => {
    try { return text(await createDoc(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "create_report",
    {
      title: "Create report",
      description: "Create a Word report with headings and bullet lines.",
      inputSchema: z.object( { title: z.string().describe("Report title."), bullets: z.string().describe("Comma separated bullet lines.").optional() }),
      annotations: WRITE,
    },
    async (args) => {
    try { return text(await createReport(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
