import { fetchCategories, type CategoryInfo } from "../api-client.js";

export const listCategoriesDefinition = {
  name: "list_categories",
  description:
    "Listet alle verfügbaren Kategorien für LLM-Modell-Empfehlungen auf. " +
    "Jede Kategorie hat eine Beschreibung, die erklärt, wann sie verwendet werden sollte. " +
    "Nutze diese Info um die passende Kategorie für deinen Use Case zu wählen, " +
    "dann rufe get_model mit der Kategorie-ID auf.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [] as string[],
  },
};

export interface ListCategoriesResult {
  categories: CategoryInfo[];
}

export async function listCategories(): Promise<ListCategoriesResult> {
  const response = await fetchCategories();
  return { categories: response.categories };
}
