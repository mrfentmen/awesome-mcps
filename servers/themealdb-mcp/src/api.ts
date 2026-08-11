const UA = 'mrfentmen-themealdb-mcp/1.0';
const BASE = 'https://www.themealdb.com/api/json/v1/1';

interface Meal {
  idMeal?: string;
  strMeal?: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb?: string;
  strYoutube?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
}

function describeMeal(m: Meal): string {
  const ings: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const name = m[`strIngredient${i}` as keyof Meal] as string | undefined;
    const measure = m[`strMeasure${i}` as keyof Meal] as string | undefined;
    if (name && name.trim()) ings.push(`${measure?.trim() ?? ''} ${name.trim()}`.trim());
  }
  return `* ${m.strMeal ?? '?'} (${m.strArea ?? '?'} | ${m.strCategory ?? '?'})\n  Ingredients: ${ings.join(', ') || '?'}\n  ${(m.strInstructions ?? '').slice(0, 180)}${(m.strInstructions ?? '').length > 180 ? '...' : ''}`;
}

export interface QueryArg {
  query: string;
}
export interface IngredientArg {
  ingredient: string;
}

export async function search(args: QueryArg): Promise<string> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(args.query)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TheMealDB returned ${res.status}`);
  const d = (await res.json()) as { meals?: Meal[] | null };
  const meals = d.meals ?? [];
  if (!meals.length) return `No meals found for "${args.query}".`;
  return `Meals matching "${args.query}" (${meals.length}):\n` + meals.slice(0, 8).map(describeMeal).join('\n');
}

export async function random(_args?: Record<string, never>): Promise<string> {
  const res = await fetch(`${BASE}/random.php`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TheMealDB returned ${res.status}`);
  const d = (await res.json()) as { meals?: Meal[] | null };
  const meal = d.meals?.[0];
  if (!meal) return 'No random meal returned.';
  return `Random meal:\n${describeMeal(meal)}`;
}

export async function categories(_args?: Record<string, never>): Promise<string> {
  const res = await fetch(`${BASE}/categories.php`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TheMealDB returned ${res.status}`);
  const d = (await res.json()) as { categories?: Array<{ strCategory?: string; strCategoryDescription?: string }> | null };
  const cats = d.categories ?? [];
  if (!cats.length) return 'No categories returned.';
  return `Meal categories (${cats.length}):\n` + cats.map((c) => `* ${c.strCategory ?? '?'} - ${(c.strCategoryDescription ?? '').slice(0, 90)}`).join('\n');
}

export async function filterByIngredient(args: IngredientArg): Promise<string> {
  const res = await fetch(`${BASE}/filter.php?i=${encodeURIComponent(args.ingredient)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TheMealDB returned ${res.status}`);
  const d = (await res.json()) as { meals?: Meal[] | null };
  const meals = d.meals ?? [];
  if (!meals.length) return `No meals with "${args.ingredient}".`;
  return `Meals with ${args.ingredient} (${meals.length}):\n` + meals.slice(0, 15).map((m, i) => `${i + 1}. ${m.strMeal ?? '?'}`).join('\n');
}
