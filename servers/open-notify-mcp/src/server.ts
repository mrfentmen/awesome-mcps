import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { astronauts } from "./api.js"
import { iss } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "open-notify-mcp", version: "1.0.0" })
  server.tool("astronauts", "List people in space right now.", {  }, async (args) => {
    try { return text(await astronauts(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("iss", "Current ISS position.", {  }, async (args) => {
    try { return text(await iss(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
