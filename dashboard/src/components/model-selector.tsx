"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Model {
  name: string;
  openrouterId: string;
  provider: string;
  pricing: { input: number; output: number };
}

interface ModelSelectorProps {
  value: string;
  models: Model[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}

// Modelle nach Provider gruppieren
function groupByProvider(models: Model[]): Record<string, Model[]> {
  return models.reduce((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);
}

// Provider-Name formatieren
function formatProviderName(provider: string): string {
  const names: Record<string, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    google: "Google",
    "meta-llama": "Meta",
    mistralai: "Mistral",
    deepseek: "DeepSeek",
    cohere: "Cohere",
    perplexity: "Perplexity",
  };
  return names[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
}

export function ModelSelector({
  value,
  models,
  onValueChange,
  placeholder = "Modell wählen...",
}: ModelSelectorProps) {
  const groupedModels = groupByProvider(models);
  const providers = Object.keys(groupedModels).sort();

  // Aktuelles Modell finden für Display
  const selectedModel = models.find(m => m.openrouterId === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedModel ? selectedModel.openrouterId : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Option zum Entfernen */}
        {placeholder === "Kein Fallback" && (
          <SelectItem value="">
            <span className="text-muted-foreground">— Kein Fallback —</span>
          </SelectItem>
        )}

        {/* Nach Provider gruppiert */}
        {providers.map((provider) => (
          <SelectGroup key={provider}>
            <SelectLabel>{formatProviderName(provider)}</SelectLabel>
            {groupedModels[provider].map((model) => (
              <SelectItem key={model.openrouterId} value={model.openrouterId}>
                <div className="flex items-center justify-between gap-4 w-full">
                  <span>{model.openrouterId}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
