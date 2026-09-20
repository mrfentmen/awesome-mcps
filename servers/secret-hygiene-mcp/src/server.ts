import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, scanSecretHygiene } from "./core.js"
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const text=(value:string)=>({content:[{type:"text" as const,text:value}]})
const errorText=(error:unknown)=>text(`Error: ${error instanceof Error?error.message:String(error)}`)
export function createServer(){const server=new McpServer({name:"secret-hygiene-mcp",version:"1.0.0"});server.registerTool(
    "scan_secret_hygiene",
    {
      title: "Scan secret hygiene",
      description: "Count secret-like patterns in bounded local files without returning values, keys, paths, filenames, or matches.",
      inputSchema: z.object({project: z.string().min(1).max(1000).default(".")}),
      annotations: READ_ONLY,
    },
    async(input)=>{try{return text(format(await scanSecretHygiene(input)))}catch(error){return errorText(error)}}
  );return server}
