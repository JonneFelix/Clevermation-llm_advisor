"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModelSelector } from "@/components/model-selector";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    keyProperty: string;
    selectedModel: string;
    fallback1: string | null;
    fallback2: string | null;
  };
  models: Array<{
    name: string;
    openrouterId: string;
    provider: string;
    pricing: { input: number; output: number };
  }>;
  onUpdate: (categoryId: string, field: "selectedModel" | "fallback1" | "fallback2", value: string) => void;
}

// Badge-Variante basierend auf Kategorie
function getCategoryBadgeVariant(keyProperty: string): "default" | "secondary" | "success" | "warning" {
  switch (keyProperty) {
    case "speed_and_cost":
    case "lowest_cost":
      return "success";
    case "reasoning_depth":
    case "intelligence":
      return "warning";
    default:
      return "secondary";
  }
}

// Preis formatieren
function formatPrice(input: number, output: number): string {
  return `$${input.toFixed(2)}/$${output.toFixed(2)}`;
}

export function CategoryCard({ category, models, onUpdate }: CategoryCardProps) {
  const badgeVariant = getCategoryBadgeVariant(category.keyProperty);

  // Aktuell ausgewählte Modelle finden
  const selectedModel = models.find(m => m.openrouterId === category.selectedModel);
  const fallback1Model = models.find(m => m.openrouterId === category.fallback1);
  const fallback2Model = models.find(m => m.openrouterId === category.fallback2);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <CardDescription className="mt-1.5">{category.description}</CardDescription>
          </div>
          <Badge variant={badgeVariant} className="ml-2 shrink-0">
            {category.keyProperty.replace(/_/g, " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Model */}
        <div className="flex items-center gap-3">
          <span className="w-20 text-sm font-medium text-muted-foreground">Primary:</span>
          <div className="flex-1">
            <ModelSelector
              value={category.selectedModel}
              models={models}
              onValueChange={(value) => onUpdate(category.id, "selectedModel", value)}
            />
          </div>
          {selectedModel && (
            <span className="text-xs text-muted-foreground w-24 text-right">
              {formatPrice(selectedModel.pricing.input, selectedModel.pricing.output)}
            </span>
          )}
        </div>

        {/* Fallback 1 */}
        <div className="flex items-center gap-3">
          <span className="w-20 text-sm font-medium text-muted-foreground">Fallback 1:</span>
          <div className="flex-1">
            <ModelSelector
              value={category.fallback1 || ""}
              models={models}
              onValueChange={(value) => onUpdate(category.id, "fallback1", value)}
              placeholder="Kein Fallback"
            />
          </div>
          {fallback1Model && (
            <span className="text-xs text-muted-foreground w-24 text-right">
              {formatPrice(fallback1Model.pricing.input, fallback1Model.pricing.output)}
            </span>
          )}
        </div>

        {/* Fallback 2 */}
        <div className="flex items-center gap-3">
          <span className="w-20 text-sm font-medium text-muted-foreground">Fallback 2:</span>
          <div className="flex-1">
            <ModelSelector
              value={category.fallback2 || ""}
              models={models}
              onValueChange={(value) => onUpdate(category.id, "fallback2", value)}
              placeholder="Kein Fallback"
            />
          </div>
          {fallback2Model && (
            <span className="text-xs text-muted-foreground w-24 text-right">
              {formatPrice(fallback2Model.pricing.input, fallback2Model.pricing.output)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
