import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { analyzeText, compareLookalikes, skeleton } from "./security.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer() {
  const server = new McpServer({ name: "unicode-security-mcp", version: "1.0.0" })
  server.registerTool(
    "analyze_text",
    {
      title: "Analyze text",
      description: "Analyze text locally for Unicode confusables, mixed scripts, invisible controls, and a heuristic risk score. Input is never sent anywhere.",
      inputSchema: z.object( { text: z.string().max(10000) }),
      annotations: READ_ONLY,
    },
    async ({ text: value }) => text(JSON.stringify(analyzeText(value), null, 2))
  )
  server.registerTool(
    "compare_identifiers",
    {
      title: "Compare identifiers",
      description: "Compare two identifiers using a Unicode-aware confusable skeleton. This is a warning aid, not a complete security proof.",
      inputSchema: z.object( { left: z.string().min(1).max(500), right: z.string().min(1).max(500) }),
      annotations: READ_ONLY,
    },
    async ({ left, right }) => text(JSON.stringify(compareLookalikes(left, right), null, 2))
  )
  server.registerTool(
    "get_skeleton",
    {
      title: "Get skeleton",
      description: "Return a local normalized confusable skeleton for one identifier.",
      inputSchema: z.object( { value: z.string().max(500) }),
      annotations: READ_ONLY,
    },
    async ({ value }) => text(skeleton(value))
  )
  return server
}
