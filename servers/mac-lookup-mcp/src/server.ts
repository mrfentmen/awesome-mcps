import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { vendorLookup } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mac-lookup-mcp", version: "1.0.0" })
  server.tool("vendor_lookup", "Get the vendor for a MAC address.", { mac: z.string().describe("MAC address like 3c:07:54:11:22:33.") }, async (args) => {
    try { return text(await vendorLookup(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
