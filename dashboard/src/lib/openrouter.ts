// OpenRouter API Client für Modell-Informationen

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
    request?: string;
    image?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

// Modelle von OpenRouter abrufen
export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const response = await fetch(`${OPENROUTER_API_URL}/models`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as OpenRouterModelsResponse;
  return data.data;
}

// Provider aus Model-ID extrahieren
export function extractProvider(modelId: string): string {
  const parts = modelId.split("/");
  return parts[0] || "unknown";
}

// Preis aus String in Number umwandeln (pro 1M Tokens)
export function parsePrice(priceStr: string): number {
  const price = parseFloat(priceStr);
  if (isNaN(price)) return 0;
  // OpenRouter gibt Preise pro Token, wir wollen pro 1M
  return price * 1_000_000;
}

// Relevante Provider filtern
const RELEVANT_PROVIDERS = [
  "anthropic",
  "openai",
  "google",
  "meta-llama",
  "mistralai",
  "deepseek",
  "cohere",
  "perplexity",
];

export function isRelevantModel(model: OpenRouterModel): boolean {
  const provider = extractProvider(model.id);
  return RELEVANT_PROVIDERS.includes(provider);
}

// Nur Chat-Modelle (keine Embedding, Image, etc.)
export function isChatModel(model: OpenRouterModel): boolean {
  const modality = model.architecture?.modality?.toLowerCase() || "";
  // Modelle ohne Modality sind oft Chat-Modelle
  if (!modality) return true;
  // Text und Multimodal sind OK
  return modality.includes("text") || modality.includes("multimodal");
}

// Modelle filtern und sortieren
export function filterAndSortModels(models: OpenRouterModel[]): OpenRouterModel[] {
  return models
    .filter(isRelevantModel)
    .filter(isChatModel)
    .sort((a, b) => {
      // Nach Provider sortieren, dann nach Name
      const providerA = extractProvider(a.id);
      const providerB = extractProvider(b.id);
      if (providerA !== providerB) {
        return providerA.localeCompare(providerB);
      }
      return a.name.localeCompare(b.name);
    });
}
