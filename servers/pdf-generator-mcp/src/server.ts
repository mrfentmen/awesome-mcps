import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createPdf } from "./api.js"
import { createReport } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pdf-generator-mcp", version: "1.0.0" })
  server.tool("create_pdf", "Create a PDF file with a title and body text.", { title: z.string().describe("Document title."), body: z.string().describe("Body text."), filename: z.string().describe("Output file name.").optional() }, async (args) => {
    try { return text(await createPdf(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("create_report", "Create a simple report PDF with a title, author, and bullet lines.", { title: z.string().describe("Report title."), author: z.string().describe("Author name.").optional(), bullets: z.string().describe("Comma separated bullet lines.").optional() }, async (args) => {
    try { return text(await createReport(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
