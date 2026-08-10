import yaml from "js-yaml"

export class YamlError extends Error {}

export async function parseYaml(args: { yaml?: string }): Promise<string> {
  const input = args.yaml ?? ""
  if (!input.trim()) throw new YamlError("Provide YAML text")
  let data: unknown
  try {
    data = yaml.load(input)
  } catch (e) {
    throw new YamlError(`Invalid YAML: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`)
  }
  return `Parsed YAML\nTop level type: ${Array.isArray(data) ? "array" : typeof data}\n\n${JSON.stringify(data, null, 2).slice(0, 3000)}`
}

export async function toJson(args: { yaml?: string }): Promise<string> {
  const input = args.yaml ?? ""
  let data: unknown
  try {
    data = yaml.load(input)
  } catch (e) {
    throw new YamlError(`Invalid YAML: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`)
  }
  return JSON.stringify(data, null, 2)
}
