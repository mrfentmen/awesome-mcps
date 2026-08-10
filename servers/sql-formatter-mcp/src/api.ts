import { format as formatSql } from "sql-formatter"

const UA = "mrfentmen-sql-formatter-mcp/1.0"
export class SqlError extends Error {}

type Dialect = "sql" | "postgresql" | "mysql" | "sqlite" | "mariadb" | "tsql"
const VALID_DIALECTS: Dialect[] = ["sql", "postgresql", "mysql", "sqlite", "mariadb", "tsql"]

export async function format(args: { sql?: string; dialect?: string }): Promise<string> {
  const sql = (args.sql ?? "").trim()
  if (!sql) throw new SqlError("Provide a SQL query")
  const dialect = (args.dialect ?? "sql").toLowerCase() as Dialect
  if (!VALID_DIALECTS.includes(dialect)) throw new SqlError(`Dialect must be one of ${VALID_DIALECTS.join(", ")}`)
  try {
    return formatSql(sql, { language: dialect, tabWidth: 2, keywordCase: "upper" })
  } catch (e) {
    throw new SqlError(`Could not format: ${e instanceof Error ? e.message : String(e)}`)
  }
}
