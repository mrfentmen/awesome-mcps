import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { decode } from "./api.js"
import { verify } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jwt-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "decode",
    {
      title: "Decode",
      description: "Decode a JWT header and payload.",
      inputSchema: z.object( { token: z.string().describe("The JWT string.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await decode(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "verify",
    {
      title: "Verify",
      description: "Verify a JWT signature with a secret.",
      inputSchema: z.object( { token: z.string().describe("The JWT string."), secret: z.string().describe("HMAC secret.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await verify(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
