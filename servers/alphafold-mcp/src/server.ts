import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { AlphaFoldError, formatPrediction, getPrediction, modelFiles } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "alphafold-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_prediction",
    {
      title: "Get structure prediction",
      description: "Get AlphaFold structure predictions for a UniProt accession: confidence scores, pipeline, dates.",
      inputSchema: z.object({
        accession: z.string().describe("UniProt accession, e.g. 'P69905' (find it with uniprot-mcp)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ accession }) => {
      try {
        const rows = await getPrediction(accession)
        if (rows.length === 0) return text(`No AlphaFold prediction for ${accession}.`)
        return text(rows.map(formatPrediction).join("\n\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "model_files",
    {
      title: "Model file links",
      description: "Direct AlphaFold model file links (mmCIF, PDB, PAE) plus the entry page, without fetching.",
      inputSchema: z.object({
        accession: z.string().describe("UniProt accession, e.g. 'P69905'"),
        version: z.enum(["v4", "v5", "v6"]).default("v6").describe("Model version"),
      }),
      annotations: READ_ONLY,
    },
    async ({ accession, version }) => {
      try {
        const f = modelFiles(accession, version)
        return text(`AlphaFold files for ${accession.trim().toUpperCase()}:\nmmCIF: ${f.cif}\nPDB: ${f.pdb}\nPAE: ${f.pae}\nPage: ${f.page}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof AlphaFoldError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
