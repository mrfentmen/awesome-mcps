const BASE = "https://www.thecocktaildb.com/api/json/v1/1"
const UA = "mrfentmen-cocktails-mcp/1.0 (https://github.com/mrfentmen)"
export class CocktailsError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new CocktailsError("TheCocktailDB rate limit hit, wait and retry")
  if (!res.ok) throw new CocktailsError(`TheCocktailDB error ${res.status}`)
  return (await res.json()) as T
}

function ingredients(c: any): string[] {
  const out: string[] = []
  for (let i = 1; i <= 15; i++) {
    const ing = c?.[`strIngredient${i}`]
    const meas = c?.[`strMeasure${i}`]
    if (ing && ing.trim()) out.push(`${meas ? meas.trim() + " " : ""}${ing.trim()}`)
  }
  return out
}

export async function searchCocktails(args: { query?: string }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new CocktailsError("Provide a cocktail name")
  const d = await get<any>(`${BASE}/search.php?s=${encodeURIComponent(q)}`)
  const drinks = d?.drinks ?? []
  if (!drinks.length) return "No cocktails found"
  return drinks.map((c: any) => `${c.strDrink} (id ${c.idDrink})\n   ${c.strCategory ?? ""} | ${c.strAlcoholic ?? ""} | ${c.strGlass ?? ""}`).join("\n\n")
}

export async function byIngredient(args: { ingredient?: string }): Promise<string> {
  const ing = (args.ingredient ?? "").trim()
  if (!ing) throw new CocktailsError("Provide an ingredient")
  const d = await get<any>(`${BASE}/filter.php?i=${encodeURIComponent(ing)}`)
  const drinks = d?.drinks ?? []
  if (!drinks.length) return `No cocktails with ${ing}`
  return drinks.slice(0, 15).map((c: any, i: number) => `${i + 1}. ${c.strDrink} (id ${c.idDrink})`).join("\n")
}

export async function cocktailDetails(args: { cocktailId?: string }): Promise<string> {
  const id = (args.cocktailId ?? "").trim()
  if (!id) throw new CocktailsError("Provide a cocktail ID")
  const d = await get<any>(`${BASE}/lookup.php?i=${encodeURIComponent(id)}`)
  const c = d?.drinks?.[0]
  if (!c) return "No cocktail found"
  const ings = ingredients(c)
  return `# ${c.strDrink}\n${c.strAlcoholic ?? ""} | ${c.strGlass ?? ""}\n\nIngredients:\n${ings.map((i) => `- ${i}`).join("\n")}\n\nInstructions:\n${c.strInstructions ?? ""}`
}
