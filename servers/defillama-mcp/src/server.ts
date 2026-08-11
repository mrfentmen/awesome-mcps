import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_chains, m0_protocol, m1_chainTvl, m1_protocolInfo, m1_topProtocols } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'defillama-mcp', version: '1.0.0' })
server.tool("chains", "TVL by chain.", {  }, async (args) => {
    try { return text(await m0_chains(args)) } catch (e) { return text(error(e)) }
  })
server.tool("protocol", "TVL history for a protocol.", { slug: z.string().describe("Protocol slug.") }, async (args) => {
    try { return text(await m0_protocol(args)) } catch (e) { return text(error(e)) }
  })
server.tool("top_protocols", "Get the top DeFi protocols by TVL.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_topProtocols(args)) } catch (e) { return text(error(e)) }
  })
server.tool("chain_tvl", "Get TVL for all chains.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_chainTvl(args)) } catch (e) { return text(error(e)) }
  })
server.tool("protocol_info", "Get details for a specific protocol.", { protocol: z.string().describe("Protocol slug.") }, async (args) => {
    try { return text(await m1_protocolInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
