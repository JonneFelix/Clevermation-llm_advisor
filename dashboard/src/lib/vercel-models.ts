// Vercel AI SDK Modell-ID Mapping
// Quelle: https://sdk.vercel.ai/providers

// Mapping von OpenRouter ID zu Vercel AI SDK ID
const VERCEL_ID_MAP: Record<string, string> = {
  // Anthropic
  "anthropic/claude-opus-4": "claude-opus-4-20250514",
  "anthropic/claude-sonnet-4": "claude-sonnet-4-20250514",
  "anthropic/claude-3.5-sonnet": "claude-3-5-sonnet-20241022",
  "anthropic/claude-3.5-haiku": "claude-3-5-haiku-20241022",
  "anthropic/claude-3-opus": "claude-3-opus-20240229",
  "anthropic/claude-3-sonnet": "claude-3-sonnet-20240229",
  "anthropic/claude-3-haiku": "claude-3-haiku-20240307",

  // OpenAI
  "openai/gpt-4o": "gpt-4o",
  "openai/gpt-4o-mini": "gpt-4o-mini",
  "openai/gpt-4-turbo": "gpt-4-turbo",
  "openai/gpt-4": "gpt-4",
  "openai/gpt-3.5-turbo": "gpt-3.5-turbo",
  "openai/o1": "o1",
  "openai/o1-mini": "o1-mini",
  "openai/o1-preview": "o1-preview",
  "openai/o3-mini": "o3-mini",

  // Google
  "google/gemini-2.0-pro-exp": "gemini-2.0-pro-exp",
  "google/gemini-2.0-flash-exp": "gemini-2.0-flash-exp",
  "google/gemini-2.0-flash-thinking-exp": "gemini-2.0-flash-thinking-exp",
  "google/gemini-1.5-pro": "gemini-1.5-pro",
  "google/gemini-1.5-flash": "gemini-1.5-flash",
  "google/gemini-pro": "gemini-pro",

  // Meta Llama (via OpenRouter oder andere Provider)
  "meta-llama/llama-3.3-70b-instruct": "llama-3.3-70b-instruct",
  "meta-llama/llama-3.1-405b-instruct": "llama-3.1-405b-instruct",
  "meta-llama/llama-3.1-70b-instruct": "llama-3.1-70b-instruct",
  "meta-llama/llama-3.1-8b-instruct": "llama-3.1-8b-instruct",

  // Mistral
  "mistralai/mistral-large": "mistral-large-latest",
  "mistralai/mistral-medium": "mistral-medium-latest",
  "mistralai/mistral-small": "mistral-small-latest",
  "mistralai/mixtral-8x7b-instruct": "open-mixtral-8x7b",
  "mistralai/mixtral-8x22b-instruct": "open-mixtral-8x22b",

  // DeepSeek
  "deepseek/deepseek-chat": "deepseek-chat",
  "deepseek/deepseek-coder": "deepseek-coder",
  "deepseek/deepseek-reasoner": "deepseek-reasoner",

  // Cohere
  "cohere/command-r-plus": "command-r-plus",
  "cohere/command-r": "command-r",
};

// Vercel ID für OpenRouter ID bekommen
export function getVercelId(openRouterId: string): string | null {
  return VERCEL_ID_MAP[openRouterId] || null;
}

// Provider-spezifische SDK Import-Strings
export function getVercelSdkImport(provider: string): string {
  const imports: Record<string, string> = {
    anthropic: '@ai-sdk/anthropic',
    openai: '@ai-sdk/openai',
    google: '@ai-sdk/google',
    mistral: '@ai-sdk/mistral',
    cohere: '@ai-sdk/cohere',
  };
  return imports[provider] || `@ai-sdk/${provider}`;
}

// Code-Beispiel für Vercel AI SDK generieren
export function generateVercelExample(openRouterId: string, vercelId: string | null): string {
  const provider = openRouterId.split("/")[0];
  if (!vercelId) {
    return `// Kein direkter Vercel AI SDK Support - nutze OpenRouter Provider
import { openrouter } from "@openrouter/ai-sdk-provider";

const model = openrouter("${openRouterId}");`;
  }

  const sdkImport = getVercelSdkImport(provider);
  const providerFn = provider === "anthropic" ? "anthropic" :
                     provider === "openai" ? "openai" :
                     provider === "google" ? "google" :
                     provider === "mistral" ? "mistral" :
                     provider === "cohere" ? "cohere" : provider;

  return `import { ${providerFn} } from "${sdkImport}";

const model = ${providerFn}("${vercelId}");`;
}

// Alle bekannten Vercel IDs
export function getAllVercelMappings(): Record<string, string> {
  return { ...VERCEL_ID_MAP };
}
