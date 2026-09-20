import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { agent } from "./api.js"
import { agents } from "./api.js"
import { maps } from "./api.js"
import { weapons } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "valorant-mcp", version: "1.0.0" })
  server.registerTool(
    "agents",
    {
      title: "Agents",
      description: "List all agents.",
      inputSchema: z.object( { language: z.string().describe("Language code like en-US.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await agents(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "agent",
    {
      title: "Agent",
      description: "Details for one agent.",
      inputSchema: z.object( { uuid: z.string().describe("Agent UUID."), language: z.string().describe("Language code.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await agent(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "maps",
    {
      title: "Maps",
      description: "List all maps.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await maps(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "weapons",
    {
      title: "Weapons",
      description: "List all weapons.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await weapons(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
