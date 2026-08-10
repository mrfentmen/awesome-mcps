import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { appLookup } from "./api.js"
import { topFree } from "./api.js"
import { topPaid } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "app-store-mcp", version: "1.0.0" })
  server.tool("top_free", "Top free apps in the App Store.", { country: z.string().describe("Two letter country code.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await topFree(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("top_paid", "Top paid apps in the App Store.", { country: z.string().describe("Two letter country code.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await topPaid(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("app_lookup", "Get details for an app by its App Store ID.", { appId: z.number().describe("App Store numeric ID.") }, async (args) => {
    try { return text(await appLookup(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
