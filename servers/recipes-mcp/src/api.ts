const BASE = "https://www.themealdb.com/api/json/v1/1"
const UA = "mrfentmen-recipes-mcp/1.0 (https://github.com/mrfentmen)"
export class RecipesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new RecipesError("TheMealDB rate limit hit, wait and retry")
  if (!res.ok) throw new RecipesError(`TheMealDB error ${res.status}`)
  return (await res.json()) as T
}

function ingredients(m: any): string[] {
  const out: string[] = []
  for (let i = 1; i <= 20; i++) {
    const ing = m?.[`strIngredient${i}`]
    const meas = m?.[`strMeasure${i}`]
    if (ing && ing.trim()) out.push(`${meas ? meas.trim() + " " : ""}${ing.trim()}`)
  }
  return out
}

export async function searchRecipes(args: { query?: string }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new RecipesError("Provide a recipe name")
  const d = await get<any>(`${BASE}/search.php?s=${encodeURIComponent(q)}`)
  const meals = d?.meals ?? []
  if (!meals.length) return "No recipes found"
  return meals.map((m: any) => `${m.strMeal} (id ${m.idMeal})\n   ${m.strArea ?? ""} ${m.strCategory ?? ""} | ${m.strTags ?? ""}`).join("\n\n")
}

export async function byIngredient(args: { ingredient?: string }): Promise<string> {
  const ing = (args.ingredient ?? "").trim()
  if (!ing) throw new RecipesError("Provide an ingredient")
  const d = await get<any>(`${BASE}/filter.php?i=${encodeURIComponent(ing)}`)
  const meals = d?.meals ?? []
  if (!meals.length) return `No recipes with ${ing}`
  return meals.slice(0, 15).map((m: any, i: number) => `${i + 1}. ${m.strMeal} (id ${m.idMeal})`).join("\n")
}

export async function recipeDetails(args: { mealId?: string }): Promise<string> {
  const id = (args.mealId ?? "").trim()
  if (!id) throw new RecipesError("Provide a meal ID")
  const d = await get<any>(`${BASE}/lookup.php?i=${encodeURIComponent(id)}`)
  const m = d?.meals?.[0]
  if (!m) return "No recipe found"
  const ings = ingredients(m)
  return `# ${m.strMeal}\n${m.strArea ?? ""} ${m.strCategory ?? ""}\n\nIngredients:\n${ings.map((i) => `- ${i}`).join("\n")}\n\nInstructions:\n${m.strInstructions ?? ""}${m.strYoutube ? `\n\nVideo: ${m.strYoutube}` : ""}`
}
