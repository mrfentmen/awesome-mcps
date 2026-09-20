// @ts-nocheck
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import * as Premiere from "./premiere.js"
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({ name: "adobe-premiere-mcp", version: "1.0.0" })

  server.registerTool(
    "is_premiere_running",
    {
      title: "Is premiere running",
      description: "Check if Adobe Premiere Pro is running.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try {
      const running = await Premiere.isPremiereRunning()
      return { content: [{ type: "text", text: JSON.stringify({ running }, null, 2) }] }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
    }
  }
  )

  server.registerTool(
    "get_project_info",
    {
      title: "Get project info",
      description: "Get information about the current Premiere Pro project.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try {
      const info = await Premiere.getProjectInfo()
      return { content: [{ type: "text", text: info }] }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
    }
  }
  )

  server.registerTool(
    "list_sequences",
    {
      title: "List sequences",
      description: "List all sequences in the current project.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try {
      const seqs = await Premiere.listSequences()
      return { content: [{ type: "text", text: seqs }] }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
    }
  }
  )

  server.registerTool(
    "list_clips",
    {
      title: "List clips",
      description: "List all clips in the first sequence.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try {
      const clips = await Premiere.listClips()
      return { content: [{ type: "text", text: clips }] }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
    }
  }
  )

  server.registerTool(
    "create_sequence",
    {
      title: "Create sequence",
      description: "Create a new sequence in the current project.",
      inputSchema: z.object(
    {
      name: z.string().describe("Sequence name"),
      width: z.number().min(1).max(10000).describe("Frame width in pixels"),
      height: z.number().min(1).max(10000).describe("Frame height in pixels"),
      frame_rate: z.number().min(1).max(120).optional().describe("Frame rate (default 30)"),
    }),
      annotations: WRITE,
    },
    async (args: any) => {
      try {
        const result = await Premiere.createSequence(args.name, args.width, args.height, args.frame_rate ?? 30)
        return { content: [{ type: "text", text: result }] }
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
      }
    }
  )

  server.registerTool(
    "import_media",
    {
      title: "Import media",
      description: "Import a media file into the current Premiere project.",
      inputSchema: z.object(
    {
      filepath: z.string().describe("Path to the media file to import"),
    }),
      annotations: WRITE,
    },
    async (args: any) => {
      try {
        const result = await Premiere.importMedia(args.filepath)
        return { content: [{ type: "text", text: result }] }
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
      }
    }
  )

  server.registerTool(
    "get_media_info",
    {
      title: "Get media info",
      description: "Get metadata about a media file.",
      inputSchema: z.object(
    {
      filepath: z.string().describe("Path to the media file"),
    }),
      annotations: READ_ONLY,
    },
    async (args: any) => {
      try {
        const info = await Premiere.getMediaInfo(args.filepath)
        return { content: [{ type: "text", text: info }] }
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
      }
    }
  )

  server.registerTool(
    "get_sequence_info",
    {
      title: "Get sequence info",
      description: "Get info about the current/active sequence.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try {
      const info = await Premiere.getSelectedSequenceInfo()
      return { content: [{ type: "text", text: info }] }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
    }
  }
  )

  server.registerTool(
    "apply_effect",
    {
      title: "Apply effect",
      description: "Apply an effect to the first clip on the first video track.",
      inputSchema: z.object(
    {
      effect: z.string().describe("Effect name (e.g. 'GaussianBlur', 'BrightnessContrast')"),
      properties: z.string().optional().describe("JSON object with effect parameters"),
    }),
      annotations: WRITE,
    },
    async (args: any) => {
      try {
        const props = args.properties ? JSON.parse(args.properties) : {}
        const result = await Premiere.applyEffect(args.effect, props)
        return { content: [{ type: "text", text: result }] }
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
      }
    }
  )

  server.registerTool(
    "export_media",
    {
      title: "Export media",
      description: "Export the current sequence to a media file.",
      inputSchema: z.object(
    {
      output: z.string().describe("Output file path"),
      format: z.enum(["h264", "prores", "hevc", "mp4"]).describe("Export format"),
      preset: z.string().optional().describe("Export preset name"),
    }),
      annotations: WRITE,
    },
    async (args: any) => {
      try {
        const result = await Premiere.exportMedia(args.output, args.format, args.preset)
        return { content: [{ type: "text", text: result }] }
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
      }
    }
  )

  server.registerTool(
    "run_custom_script",
    {
      title: "Run custom script",
      description: "Run custom ExtendScript code in Adobe Premiere Pro.",
      inputSchema: z.object(
    {
      script: z.string().describe("ExtendScript (JavaScript) code to execute"),
    }),
      annotations: WRITE,
    },
    async (args: any) => {
      try {
        const result = await Premiere.runCustomScript(args.script)
        return { content: [{ type: "text", text: result.stdout || result.stderr }] }
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] , isError: true }
      }
    }
  )

  return server
}
