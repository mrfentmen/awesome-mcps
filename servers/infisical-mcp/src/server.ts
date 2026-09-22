import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listSecrets,
  getSecret,
  createSecret,
  updateSecret,
  deleteSecret,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const NON_READ_ONLY = { openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "infisical-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_secrets",
    {
      title: "List secrets",
      description: "Secrets in an Infisical project environment and path.",
      inputSchema: z.object({
        projectId: z.string().describe("Project id"),
        environment: z.string().default("dev").describe("Environment slug"),
        secretPath: z.string().default("/").describe("Secret path"),
      }),
      annotations: READ_ONLY,
    },
    async ({ projectId, environment, secretPath }) => {
      try {
        return text(await listSecrets(projectId, environment, secretPath));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_secret",
    {
      title: "Get one secret",
      description: "Single Infisical secret value by key.",
      inputSchema: z.object({
        projectId: z.string().describe("Project id"),
        environment: z.string().default("dev").describe("Environment"),
        secretPath: z.string().default("/").describe("Path"),
        key: z.string().describe("Secret key"),
      }),
      annotations: READ_ONLY,
    },
    async ({ projectId, environment, secretPath, key }) => {
      try {
        return text(await getSecret(projectId, environment, secretPath, key));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "create_secret",
    {
      title: "Create secret",
      description: "Create an Infisical secret. Fails if the key already exists (use update).",
      inputSchema: z.object({
        projectId: z.string().describe("Project id"),
        environment: z.string().default("dev").describe("Environment"),
        secretPath: z.string().default("/").describe("Path"),
        key: z.string().describe("Secret key"),
        value: z.string().describe("Secret value"),
      }),
      annotations: NON_READ_ONLY,
    },
    async ({ projectId, environment, secretPath, key, value }) => {
      try {
        return text(await createSecret(projectId, environment, secretPath, key, value));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "update_secret",
    {
      title: "Update secret",
      description: "Change an existing Infisical secret value.",
      inputSchema: z.object({
        projectId: z.string().describe("Project id"),
        environment: z.string().default("dev").describe("Environment"),
        secretPath: z.string().default("/").describe("Path"),
        key: z.string().describe("Secret key"),
        value: z.string().describe("New value"),
      }),
      annotations: NON_READ_ONLY,
    },
    async ({ projectId, environment, secretPath, key, value }) => {
      try {
        return text(await updateSecret(projectId, environment, secretPath, key, value));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "delete_secret",
    {
      title: "Delete secret",
      description: "Delete an Infisical secret by key.",
      inputSchema: z.object({
        projectId: z.string().describe("Project id"),
        environment: z.string().default("dev").describe("Environment"),
        secretPath: z.string().default("/").describe("Path"),
        key: z.string().describe("Secret key"),
      }),
      annotations: NON_READ_ONLY,
    },
    async ({ projectId, environment, secretPath, key }) => {
      try {
        return text(await deleteSecret(projectId, environment, secretPath, key));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
