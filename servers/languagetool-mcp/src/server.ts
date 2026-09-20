import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { checkText, formatResult, LanguageToolError, listLanguages } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "languagetool-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "check_text",
    {
      title: "Check grammar",
      description: "Check grammar, spelling and style in 30+ languages. Returns issues with fix suggestions.",
      inputSchema: z.object({
        text: z.string().max(20000).describe("Text to check (max 20000 chars)"),
        language: z.string().default("auto").describe("Language code like 'en-US', 'de', 'fr', or 'auto'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ text: input, language }) => {
      try {
        return text(formatResult(await checkText(input, language)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "list_languages",
    {
      title: "List languages",
      description: "Supported LanguageTool language codes.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const langs = await listLanguages()
        return text(langs.map((l) => `${l.code} — ${l.name}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof LanguageToolError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
