import { NextRequest, NextResponse } from "next/server";
import { getCategory, updateCategory, getAllCategories } from "@/lib/db";

// Einfache Auth-Prüfung über Header
function checkAuth(request: NextRequest): boolean {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    // Wenn kein Secret konfiguriert, erlaube lokale Requests
    return true;
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;

  const [type, token] = authHeader.split(" ");
  return type === "Bearer" && token === authSecret;
}

// GET /api/config - Alle Kategorien mit Modell-Auswahl abrufen
export async function GET(request: NextRequest) {
  try {
    const categories = getAllCategories();

    const config = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      keyProperty: cat.key_property,
      selectedModel: cat.selected_model,
      fallback1: cat.fallback_1,
      fallback2: cat.fallback_2,
      updatedAt: cat.updated_at,
    }));

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Fehler beim Abrufen der Konfiguration:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// POST /api/config - Kategorie-Konfiguration aktualisieren
export async function POST(request: NextRequest) {
  try {
    // Auth prüfen
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { categoryId, selectedModel, fallback1, fallback2 } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId ist erforderlich" },
        { status: 400 }
      );
    }

    // Kategorie existiert?
    const category = getCategory(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: `Kategorie '${categoryId}' nicht gefunden` },
        { status: 404 }
      );
    }

    // Update durchführen
    const updates: { selected_model?: string; fallback_1?: string | null; fallback_2?: string | null } = {};

    if (selectedModel !== undefined) {
      updates.selected_model = selectedModel;
    }
    if (fallback1 !== undefined) {
      updates.fallback_1 = fallback1 || null;
    }
    if (fallback2 !== undefined) {
      updates.fallback_2 = fallback2 || null;
    }

    updateCategory(categoryId, updates);

    // Aktualisierte Kategorie zurückgeben
    const updatedCategory = getCategory(categoryId);

    return NextResponse.json({
      success: true,
      category: {
        id: updatedCategory!.id,
        selectedModel: updatedCategory!.selected_model,
        fallback1: updatedCategory!.fallback_1,
        fallback2: updatedCategory!.fallback_2,
        updatedAt: updatedCategory!.updated_at,
      },
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Konfiguration:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
