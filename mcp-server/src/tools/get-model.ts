import { fetchModel, type GetModelResponse } from "../api-client.js";

export const getModelDefinition = {
  name: "get_model",
  description:
    "Holt das empfohlene LLM-Modell für eine Kategorie inkl. 2 Fallback-Modelle. " +
    "Gibt sowohl OpenRouter-IDs als auch Vercel AI SDK IDs zurück. " +
    "Optional kann nach Provider gefiltert werden (z.B. 'anthropic', 'openai', 'google').",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        description:
          "Die Kategorie-ID (z.B. 'tool-use', 'writer', 'reasoning'). " +
          "Nutze list_categories um alle verfügbaren Kategorien zu sehen.",
      },
      provider: {
        type: "string",
        description:
          "Optional: Filter auf einen Provider (z.B. 'anthropic', 'openai', 'google'). " +
          "Wenn gesetzt, wird nur ein Modell dieses Providers empfohlen.",
      },
    },
    required: ["category"] as string[],
  },
};

export interface GetModelInput {
  category: string;
  provider?: string;
}

export async function getModel(input: GetModelInput): Promise<GetModelResponse> {
  return fetchModel(input.category, input.provider);
}
