// Shared Types für API Responses

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

export interface GetModelResponse {
  category: string;
  recommended: ModelInfo;
  fallbacks: ModelInfo[];
}

export interface CategoriesResponse {
  categories: CategoryInfo[];
}

export interface ModelsResponse {
  models: ModelInfo[];
  total: number;
  cached_at?: string;
}

export interface SyncResponse {
  success: boolean;
  modelsCount: number;
  message: string;
}

export interface ErrorResponse {
  error: string;
}
