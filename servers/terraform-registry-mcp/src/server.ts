import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { module } from "./api.js"
import { provider } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "terraform-registry-mcp", version: "1.0.0" })
  server.tool("provider", "Details for a Terraform provider.", { namespace: z.string().describe("Namespace like hashicorp."), name: z.string().describe("Provider name like aws.") }, async (args) => {
    try { return text(await provider(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("module", "Details for a Terraform module.", { namespace: z.string().describe("Namespace."), name: z.string().describe("Module name."), provider: z.string().describe("Provider like aws.") }, async (args) => {
    try { return text(await module(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
