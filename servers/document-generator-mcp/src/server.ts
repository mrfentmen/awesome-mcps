import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createDoc } from "./api.js"
import { createReport } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "document-generator-mcp", version: "1.0.0" })
  server.tool("create_doc", "Create a Word document with a title and paragraphs.", { title: z.string().describe("Document title."), body: z.string().describe("Body paragraphs separated by blank lines."), filename: z.string().describe("Output file name.").optional() }, async (args) => {
    try { return text(await createDoc(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("create_report", "Create a Word report with headings and bullet lines.", { title: z.string().describe("Report title."), bullets: z.string().describe("Comma separated bullet lines.").optional() }, async (args) => {
    try { return text(await createReport(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
