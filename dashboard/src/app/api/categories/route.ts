import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/db";

// GET /api/categories - Alle Kategorien abrufen
export async function GET() {
  try {
    const categories = getAllCategories();

    // Für MCP-Tool Format aufbereiten
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      keyProperty: cat.key_property,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error("Fehler beim Abrufen der Kategorien:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
