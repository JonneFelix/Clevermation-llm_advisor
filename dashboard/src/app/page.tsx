"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/category-card";
import { RefreshCw, Loader2 } from "lucide-react";

interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  keyProperty: string;
  selectedModel: string;
  fallback1: string | null;
  fallback2: string | null;
  updatedAt: string;
}

interface Model {
  name: string;
  openrouterId: string;
  provider: string;
  pricing: { input: number; output: number };
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Daten laden
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [configRes, modelsRes] = await Promise.all([
        fetch("/api/config"),
        fetch("/api/models?limit=200"),
      ]);

      if (!configRes.ok || !modelsRes.ok) {
        throw new Error("Fehler beim Laden der Daten");
      }

      const configData = await configRes.json();
      const modelsData = await modelsRes.json();

      setCategories(configData.config);
      setModels(modelsData.models);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync mit OpenRouter
  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);

      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sync fehlgeschlagen");
      }

      // Nach Sync neu laden
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync fehlgeschlagen");
    } finally {
      setSyncing(false);
    }
  };

  // Kategorie aktualisieren
  const handleCategoryUpdate = async (
    categoryId: string,
    field: "selectedModel" | "fallback1" | "fallback2",
    value: string
  ) => {
    try {
      const body: Record<string, string> = { categoryId };
      body[field] = value;

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Update fehlgeschlagen");
      }

      // Lokal aktualisieren
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, [field]: value || null } : cat
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update fehlgeschlagen");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">LLM Advisor</h1>
            <p className="text-muted-foreground mt-1">
              Zentrale Modell-Empfehlungen für Clevermation Projekte
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="gap-2"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {syncing ? "Synchronisiere..." : "Sync OpenRouter"}
          </Button>
        </div>

        {/* Fehler-Anzeige */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Info wenn keine Modelle */}
        {models.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            Keine Modelle im Cache. Klicke auf &ldquo;Sync OpenRouter&rdquo; um Modelle zu laden.
          </div>
        )}

        {/* Kategorien */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              models={models}
              onUpdate={handleCategoryUpdate}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            MCP Endpoint:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded">
              mcp.llm-advisor.clevermation.com
            </code>
          </p>
          <p className="mt-1">
            {models.length} Modelle im Cache
          </p>
        </div>
      </div>
    </div>
  );
}
