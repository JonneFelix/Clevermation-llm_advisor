import Database from "better-sqlite3";
import path from "path";

// Datenbank-Pfad aus Environment oder Default
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "llm-advisor.db");

// Sicherstellen dass das Verzeichnis existiert
import { mkdirSync } from "fs";
try {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
} catch {
  // Verzeichnis existiert bereits
}

// Singleton-Instanz
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database: Database.Database) {
  // Kategorien-Tabelle
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      key_property TEXT NOT NULL,
      selected_model TEXT NOT NULL,
      fallback_1 TEXT,
      fallback_2 TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Modell-Cache-Tabelle
  database.exec(`
    CREATE TABLE IF NOT EXISTS models_cache (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      openrouter_id TEXT NOT NULL,
      vercel_id TEXT,
      context_window INTEGER,
      input_price REAL,
      output_price REAL,
      cached_price REAL,
      supports_tools INTEGER DEFAULT 0,
      supports_vision INTEGER DEFAULT 0,
      supports_json INTEGER DEFAULT 0,
      strengths TEXT,
      cached_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Default-Kategorien einfügen falls leer
  const count = database.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (count.count === 0) {
    seedDefaultCategories(database);
  }
}

function seedDefaultCategories(database: Database.Database) {
  const defaultCategories = [
    {
      id: "triage",
      name: "Triage / Klassifikation",
      description: "Schnelle Ja/Nein Entscheidungen, Sentiment-Analyse, Routing. Ideal wenn Geschwindigkeit und Kosten wichtiger sind als maximale Qualität.",
      key_property: "speed_and_cost",
      selected_model: "anthropic/claude-3.5-haiku",
      fallback_1: "openai/gpt-4o-mini",
      fallback_2: "google/gemini-2.0-flash-exp",
    },
    {
      id: "writer",
      name: "Writer / Texte",
      description: "E-Mails schreiben, Texte formulieren, Zusammenfassungen. Braucht gute Sprachqualität und natürlichen Stil.",
      key_property: "language_quality",
      selected_model: "anthropic/claude-sonnet-4",
      fallback_1: "openai/gpt-4o",
      fallback_2: "google/gemini-2.0-pro-exp",
    },
    {
      id: "analyst",
      name: "Analyst / Entscheidungen",
      description: "Komplexe Analysen, Root-Cause Analyse, strategische Entscheidungen. Braucht tiefes Verständnis und gutes Urteilsvermögen.",
      key_property: "intelligence",
      selected_model: "anthropic/claude-sonnet-4",
      fallback_1: "openai/gpt-4o",
      fallback_2: "google/gemini-2.0-pro-exp",
    },
    {
      id: "coder",
      name: "Coder / Programmierung",
      description: "Code schreiben, Debugging, Refactoring. Braucht exzellente Code-Qualität und Framework-Kenntnisse.",
      key_property: "code_quality",
      selected_model: "anthropic/claude-sonnet-4",
      fallback_1: "openai/gpt-4o",
      fallback_2: "google/gemini-2.0-pro-exp",
    },
    {
      id: "tool-use",
      name: "Tool Use / Function Calling",
      description: "Für Agents die Tools/Functions aufrufen. Braucht zuverlässiges Tool-Calling mit korrekten Parametern.",
      key_property: "tool_calling_accuracy",
      selected_model: "anthropic/claude-sonnet-4",
      fallback_1: "openai/gpt-4o",
      fallback_2: "google/gemini-2.0-pro-exp",
    },
    {
      id: "structured",
      name: "Structured Output",
      description: "JSON generieren, Schema-basierte Extraktion. Braucht zuverlässige, valide Outputs die exakt dem Schema entsprechen.",
      key_property: "output_reliability",
      selected_model: "openai/gpt-4o",
      fallback_1: "anthropic/claude-sonnet-4",
      fallback_2: "google/gemini-2.0-pro-exp",
    },
    {
      id: "reasoning",
      name: "Deep Reasoning",
      description: "Komplexe Multi-Step Probleme, mathematisches Reasoning. Für Tasks die tiefes Nachdenken erfordern (o1/o3 style).",
      key_property: "reasoning_depth",
      selected_model: "anthropic/claude-opus-4",
      fallback_1: "openai/o3-mini",
      fallback_2: "google/gemini-2.0-flash-thinking-exp",
    },
    {
      id: "long-context",
      name: "Long Context",
      description: "Große Dokumente, RAG mit vielen Chunks. Braucht großes Context Window (200k+) und gute Retrieval-Fähigkeiten.",
      key_property: "context_window",
      selected_model: "google/gemini-2.0-pro-exp",
      fallback_1: "anthropic/claude-sonnet-4",
      fallback_2: "openai/gpt-4o",
    },
    {
      id: "vision",
      name: "Vision / Bildanalyse",
      description: "Bildanalyse, Screenshots, Dokumente mit Bildern. Braucht starke multimodale Fähigkeiten.",
      key_property: "vision_quality",
      selected_model: "anthropic/claude-sonnet-4",
      fallback_1: "openai/gpt-4o",
      fallback_2: "google/gemini-2.0-pro-exp",
    },
    {
      id: "budget",
      name: "Budget / Sparen",
      description: "Maximales Sparen bei einfachen Tasks. Für Aufgaben wo Kosten wichtiger sind als Qualität.",
      key_property: "lowest_cost",
      selected_model: "google/gemini-2.0-flash-exp",
      fallback_1: "openai/gpt-4o-mini",
      fallback_2: "anthropic/claude-3.5-haiku",
    },
  ];

  const stmt = database.prepare(`
    INSERT INTO categories (id, name, description, key_property, selected_model, fallback_1, fallback_2)
    VALUES (@id, @name, @description, @key_property, @selected_model, @fallback_1, @fallback_2)
  `);

  for (const category of defaultCategories) {
    stmt.run(category);
  }
}

// Typen
export interface Category {
  id: string;
  name: string;
  description: string;
  key_property: string;
  selected_model: string;
  fallback_1: string | null;
  fallback_2: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModelCache {
  id: string;
  name: string;
  provider: string;
  openrouter_id: string;
  vercel_id: string | null;
  context_window: number | null;
  input_price: number | null;
  output_price: number | null;
  cached_price: number | null;
  supports_tools: number;
  supports_vision: number;
  supports_json: number;
  strengths: string | null;
  cached_at: string;
}

// CRUD-Operationen für Kategorien
export function getAllCategories(): Category[] {
  return getDb().prepare("SELECT * FROM categories ORDER BY id").all() as Category[];
}

export function getCategory(id: string): Category | undefined {
  return getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
}

export function updateCategory(id: string, updates: Partial<Pick<Category, "selected_model" | "fallback_1" | "fallback_2">>): void {
  const setClauses: string[] = [];
  const values: (string | null)[] = [];

  if (updates.selected_model !== undefined) {
    setClauses.push("selected_model = ?");
    values.push(updates.selected_model);
  }
  if (updates.fallback_1 !== undefined) {
    setClauses.push("fallback_1 = ?");
    values.push(updates.fallback_1);
  }
  if (updates.fallback_2 !== undefined) {
    setClauses.push("fallback_2 = ?");
    values.push(updates.fallback_2);
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  getDb().prepare(`UPDATE categories SET ${setClauses.join(", ")} WHERE id = ?`).run(...values);
}

// CRUD-Operationen für Modell-Cache
export function getAllModels(): ModelCache[] {
  return getDb().prepare("SELECT * FROM models_cache ORDER BY provider, name").all() as ModelCache[];
}

export function getModel(id: string): ModelCache | undefined {
  return getDb().prepare("SELECT * FROM models_cache WHERE id = ?").get(id) as ModelCache | undefined;
}

export function upsertModel(model: Omit<ModelCache, "cached_at">): void {
  getDb().prepare(`
    INSERT INTO models_cache (id, name, provider, openrouter_id, vercel_id, context_window, input_price, output_price, cached_price, supports_tools, supports_vision, supports_json, strengths)
    VALUES (@id, @name, @provider, @openrouter_id, @vercel_id, @context_window, @input_price, @output_price, @cached_price, @supports_tools, @supports_vision, @supports_json, @strengths)
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      provider = @provider,
      openrouter_id = @openrouter_id,
      vercel_id = @vercel_id,
      context_window = @context_window,
      input_price = @input_price,
      output_price = @output_price,
      cached_price = @cached_price,
      supports_tools = @supports_tools,
      supports_vision = @supports_vision,
      supports_json = @supports_json,
      strengths = @strengths,
      cached_at = CURRENT_TIMESTAMP
  `).run(model);
}

export function clearModelsCache(): void {
  getDb().prepare("DELETE FROM models_cache").run();
}
