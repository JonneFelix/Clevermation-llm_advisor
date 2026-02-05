import { NextRequest, NextResponse } from "next/server";
import { upsertModel, clearModelsCache } from "@/lib/db";
import {
  fetchOpenRouterModels,
  filterAndSortModels,
  extractProvider,
  parsePrice,
} from "@/lib/openrouter";
import { getVercelId } from "@/lib/vercel-models";
import type { SyncResponse } from "@/lib/types";

// Einfache Auth-Prüfung
function checkAuth(request: NextRequest): boolean {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) return true;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;

  const [type, token] = authHeader.split(" ");
  return type === "Bearer" && token === authSecret;
}

// Stärken basierend auf Modell-Eigenschaften ableiten
function deriveStrengths(model: { id: string; context_length: number }): string[] {
  const strengths: string[] = [];
  const id = model.id.toLowerCase();

  // Provider-basierte Stärken
  if (id.includes("claude")) {
    strengths.push("instructions", "coding", "safety");
    if (id.includes("sonnet")) {
      strengths.push("tool-calling", "balanced");
    } else if (id.includes("opus")) {
      strengths.push("reasoning", "complex-tasks");
    } else if (id.includes("haiku")) {
      strengths.push("speed", "cost-effective");
    }
  }

  if (id.includes("gpt-4o")) {
    strengths.push("multimodal", "structured-output");
    if (id.includes("mini")) {
      strengths.push("speed", "cost-effective");
    } else {
      strengths.push("tool-calling", "reasoning");
    }
  }

  if (id.includes("o1") || id.includes("o3")) {
    strengths.push("reasoning", "math", "complex-problems");
  }

  if (id.includes("gemini")) {
    if (id.includes("flash")) {
      strengths.push("speed", "cost-effective");
    }
    if (id.includes("thinking")) {
      strengths.push("reasoning");
    }
    if (id.includes("pro")) {
      strengths.push("long-context", "multimodal");
    }
  }

  if (id.includes("deepseek")) {
    strengths.push("coding", "cost-effective");
    if (id.includes("reasoner")) {
      strengths.push("reasoning");
    }
  }

  // Context-basierte Stärken
  if (model.context_length >= 200000) {
    strengths.push("long-context");
  }

  return [...new Set(strengths)]; // Duplikate entfernen
}

// POST /api/sync - Modelle von OpenRouter synchronisieren
export async function POST(request: NextRequest) {
  try {
    // Auth prüfen
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    console.log("Starte OpenRouter Sync...");

    // Modelle von OpenRouter abrufen
    const allModels = await fetchOpenRouterModels();
    console.log(`${allModels.length} Modelle von OpenRouter abgerufen`);

    // Filtern und sortieren
    const relevantModels = filterAndSortModels(allModels);
    console.log(`${relevantModels.length} relevante Modelle nach Filter`);

    // Cache leeren und neu befüllen
    clearModelsCache();

    let synced = 0;
    for (const model of relevantModels) {
      const provider = extractProvider(model.id);
      const vercelId = getVercelId(model.id);
      const strengths = deriveStrengths(model);

      upsertModel({
        id: model.id,
        name: model.name,
        provider,
        openrouter_id: model.id,
        vercel_id: vercelId,
        context_window: model.context_length,
        input_price: parsePrice(model.pricing.prompt),
        output_price: parsePrice(model.pricing.completion),
        cached_price: null, // OpenRouter gibt keine Cached-Preise
        supports_tools: model.id.includes("claude") || model.id.includes("gpt-4") ? 1 : 0,
        supports_vision: model.architecture?.modality?.includes("multimodal") ? 1 : 0,
        supports_json: 1, // Die meisten modernen Modelle unterstützen JSON
        strengths: JSON.stringify(strengths),
      });
      synced++;
    }

    console.log(`${synced} Modelle in Cache gespeichert`);

    const response: SyncResponse = {
      success: true,
      modelsCount: synced,
      message: `${synced} Modelle von OpenRouter synchronisiert`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fehler beim Sync:", error);
    return NextResponse.json(
      {
        error: "Sync fehlgeschlagen",
        details: error instanceof Error ? error.message : "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}

// GET /api/sync - Sync-Status abrufen
export async function GET() {
  return NextResponse.json({
    info: "POST an diese Route um Modelle von OpenRouter zu synchronisieren",
    note: "Erfordert Authorization Header wenn AUTH_SECRET gesetzt ist",
  });
}
