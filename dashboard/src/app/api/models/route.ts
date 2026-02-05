import { NextRequest, NextResponse } from "next/server";
import { getAllModels } from "@/lib/db";
import type { ModelInfo, ModelsResponse } from "@/lib/types";

// GET /api/models?provider=anthropic&limit=50
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerFilter = searchParams.get("provider");
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : 100;

    let models = getAllModels();

    // Provider-Filter
    if (providerFilter) {
      models = models.filter(
        (m) => m.provider.toLowerCase() === providerFilter.toLowerCase()
      );
    }

    // Limit anwenden
    const limitedModels = models.slice(0, limit);

    // In API-Format umwandeln
    const formattedModels: ModelInfo[] = limitedModels.map((m) => ({
      name: m.name,
      openrouterId: m.openrouter_id,
      vercelId: m.vercel_id,
      provider: m.provider,
      pricing: {
        input: m.input_price ?? 0,
        output: m.output_price ?? 0,
        cached: m.cached_price ?? undefined,
      },
      contextWindow: m.context_window,
      strengths: m.strengths ? JSON.parse(m.strengths) : undefined,
    }));

    const response: ModelsResponse = {
      models: formattedModels,
      total: models.length,
      cached_at: limitedModels[0]?.cached_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fehler beim Abrufen der Modelle:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
