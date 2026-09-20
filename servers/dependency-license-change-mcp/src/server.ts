import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, compareLicenseEvidence } from "./core.js"
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const text=(value:string)=>({content:[{type:"text" as const,text:value}]})
const errorText=(error:unknown)=>text(`Error: ${error instanceof Error?error.message:String(error)}`)
export function createServer(){const server=new McpServer({name:"dependency-license-change-mcp",version:"1.0.0"});server.registerTool(
    "compare_license_evidence",
    {
      title: "Compare license evidence",
      description: "Compare local license evidence across two snapshots without returning package names, text, paths, or source.",
      inputSchema: z.object({before: z.string().min(1).max(1000), after: z.string().min(1).max(1000)}),
      annotations: READ_ONLY,
    },
    async(input)=>{try{return text(format(await compareLicenseEvidence(input)))}catch(error){return errorText(error)}}
  );return server}
