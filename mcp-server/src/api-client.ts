// API Client für Dashboard-Kommunikation

const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:3000";

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  keyProperty: string;
}

export interface ModelPricing {
  input: number;
  output: number;
  cached?: number;
}

export interface ModelInfo {
  name: string;
  openrouterId: string;
  vercelId: string | null;
  provider: string;
  pricing: ModelPricing;
  contextWindow: number | null;
  strengths?: string[];
}

export interface CategoriesResponse {
  categories: CategoryInfo[];
}

export interface GetModelResponse {
  category: string;
  recommended: ModelInfo;
  fallbacks: ModelInfo[];
}

// Kategorien vom Dashboard abrufen
export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch(`${DASHBOARD_URL}/api/categories`);

  if (!response.ok) {
    throw new Error(`Dashboard API Fehler: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Modell für Kategorie abrufen
export async function fetchModel(category: string, provider?: string): Promise<GetModelResponse> {
  const params = new URLSearchParams({ category });
  if (provider) {
    params.set("provider", provider);
  }

  const response = await fetch(`${DASHBOARD_URL}/api/model?${params}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Dashboard API Fehler: ${response.status}`);
  }

  return response.json();
}
