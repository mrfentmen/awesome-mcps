const KEY = process.env.USDA_API_KEY ?? ""
const BASE = "https://api.nal.usda.gov/fdc/v1"
const UA = "mrfentmen-nutrition-mcp/1.0 (https://github.com/mrfentmen)"
export class NutritionError extends Error {}

export async function searchFood(args: { query?: string; limit?: number }): Promise<string> {
  if (!KEY) throw new NutritionError("Set the USDA_API_KEY environment variable to your free USDA FoodData Central key")
  const q = (args.query ?? "").trim()
  if (!q) throw new NutritionError("Provide a food name")
  const limit = Math.min(args.limit ?? 5, 20)
  const res = await fetch(`${BASE}/foods/search?api_key=${KEY}&query=${encodeURIComponent(q)}&pageSize=${limit}&dataType=Foundation,SR Legacy`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 401 || res.status === 403) throw new NutritionError("USDA rejected the key. Check USDA_API_KEY.")
  if (!res.ok) throw new NutritionError(`USDA error ${res.status}`)
  const d = await res.json()
  const foods = d.foods ?? []
  return foods.map((f: any) => {
    const n = (f.foodNutrients ?? []).filter((x: any) => x.value != null)
    const cal = n.find((x: any) => x.nutrientName?.includes("Energy"))?.value
    const protein = n.find((x: any) => x.nutrientName?.includes("Protein"))?.value
    const carbs = n.find((x: any) => x.nutrientName?.includes("Carbohydrate"))?.value
    const fat = n.find((x: any) => x.nutrientName?.includes("Total lipid"))?.value
    return `${f.description ?? ""}\n  Per 100g: ${cal ? `${cal} kcal` : "energy n/a"}${protein ? ` | protein ${protein}g` : ""}${carbs ? ` | carbs ${carbs}g` : ""}${fat ? ` | fat ${fat}g` : ""}`
  }).join("\n\n") || "No foods found"
}
