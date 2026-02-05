import { NextRequest, NextResponse } from "next/server";
import { getCategory, getModel, getAllModels } from "@/lib/db";
import { getVercelId } from "@/lib/vercel-models";
import type { ModelInfo, GetModelResponse } from "@/lib/types";

// GET /api/model?category=tool-use&provider=anthropic
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("category");
    const providerFilter = searchParams.get("provider");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Parameter 'category' ist erforderlich" },
        { status: 400 }
      );
    }

    const category = getCategory(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: `Kategorie '${categoryId}' nicht gefunden` },
        { status: 404 }
      );
    }

    // Modell-Infos laden
    const models = getAllModels();
    const modelsMap = new Map(models.map(m => [m.openrouter_id, m]));

    // Helper-Funktion um ModelInfo zu erstellen
    function buildModelInfo(openrouterId: string): ModelInfo | null {
      const cachedModel = modelsMap.get(openrouterId);

      // Falls im Cache, nutze Cache-Daten
      if (cachedModel) {
        return {
          name: cachedModel.name,
          openrouterId: cachedModel.openrouter_id,
          vercelId: cachedModel.vercel_id,
          provider: cachedModel.provider,
          pricing: {
            input: cachedModel.input_price ?? 0,
            output: cachedModel.output_price ?? 0,
            cached: cachedModel.cached_price ?? undefined,
          },
          contextWindow: cachedModel.context_window,
          strengths: cachedModel.strengths ? JSON.parse(cachedModel.strengths) : undefined,
        };
      }

      // Fallback: Nur IDs ohne Details
      const provider = openrouterId.split("/")[0];
      const name = openrouterId.split("/")[1]?.replace(/-/g, " ") || openrouterId;

      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        openrouterId,
        vercelId: getVercelId(openrouterId),
        provider,
        pricing: { input: 0, output: 0 },
        contextWindow: null,
      };
    }

    // Provider-Filter anwenden
    function matchesProvider(openrouterId: string): boolean {
      if (!providerFilter) return true;
      const provider = openrouterId.split("/")[0];
      return provider.toLowerCase() === providerFilter.toLowerCase();
    }

    // Empfohlenes Modell
    let recommendedId = category.selected_model;
    if (providerFilter && !matchesProvider(recommendedId)) {
      // Wenn Provider-Filter nicht matched, suche Alternative
      const alternatives = [category.fallback_1, category.fallback_2].filter(Boolean) as string[];
      const matchingAlt = alternatives.find(matchesProvider);
      if (matchingAlt) {
        recommendedId = matchingAlt;
      }
    }

    const recommended = buildModelInfo(recommendedId);
    if (!recommended) {
      return NextResponse.json(
        { error: `Modell '${recommendedId}' nicht gefunden` },
        { status: 404 }
      );
    }

    // Fallbacks
    const fallbackIds = [category.fallback_1, category.fallback_2]
      .filter((id): id is string => !!id && id !== recommendedId)
      .filter(matchesProvider);

    const fallbacks = fallbackIds
      .map(buildModelInfo)
      .filter((m): m is ModelInfo => m !== null);

    const response: GetModelResponse = {
      category: categoryId,
      recommended,
      fallbacks,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fehler beim Abrufen des Modells:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
