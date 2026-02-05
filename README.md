# LLM Advisor

Zentrale LLM Modell-Empfehlungen für Clevermation Projekte.

## Features

- **Dashboard**: Web-UI zum Konfigurieren von Modell-Empfehlungen pro Use Case
- **MCP Server**: Remote MCP für Claude Code Integration
- **OpenRouter Sync**: Automatisches Laden von Modell-Informationen
- **Kategorien**: Vordefinierte Use Cases (Tool-Use, Writer, Reasoning, etc.)

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│           mcp.llm-advisor.clevermation.com (MCP)            │
│  - list_categories: Alle Kategorien mit Beschreibungen     │
│  - get_model: Empfohlenes Modell + 2 Fallbacks             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│           llm-advisor.clevermation.com (Dashboard)          │
│  - Kategorien-Übersicht mit Modell-Auswahl                 │
│  - OpenRouter Sync                                          │
│  - SQLite Persistenz                                        │
└─────────────────────────────────────────────────────────────┘
```

## Kategorien

| ID | Use Case | Optimiert für |
|----|----------|---------------|
| triage | Schnelle Klassifikation | Speed, Cost |
| writer | Texte, E-Mails | Language Quality |
| analyst | Komplexe Analysen | Intelligence |
| coder | Code-Generierung | Code Quality |
| tool-use | Function Calling | Tool Accuracy |
| structured | JSON Output | Output Reliability |
| reasoning | Deep Thinking | Reasoning Depth |
| long-context | Große Dokumente | Context Window |
| vision | Bildanalyse | Multimodal |
| budget | Maximales Sparen | Lowest Cost |

## Lokale Entwicklung

```bash
# Dashboard
cd dashboard
bun install
bun dev

# MCP Server
cd mcp-server
bun install
bun dev
```

## Docker Deployment

```bash
docker compose up --build
```

## MCP Integration

### Claude Code (global)

In `~/.mcp.json`:

```json
{
  "mcpServers": {
    "llm-advisor": {
      "command": "bun",
      "args": ["run", "/path/to/llm-advisor/mcp-server/src/index.ts"],
      "env": {
        "DASHBOARD_URL": "https://llm-advisor.clevermation.com"
      }
    }
  }
}
```

### Nutzung

```
# Kategorien auflisten
mcp__llm-advisor__list_categories

# Modell für Tool-Use holen
mcp__llm-advisor__get_model { category: "tool-use" }

# Nur Anthropic Modelle
mcp__llm-advisor__get_model { category: "tool-use", provider: "anthropic" }
```

## API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/categories` | GET | Alle Kategorien |
| `/api/model` | GET | Modell für Kategorie |
| `/api/models` | GET | Alle gecachten Modelle |
| `/api/config` | GET/POST | Konfiguration lesen/ändern |
| `/api/sync` | POST | OpenRouter Sync |

## Environment Variables

| Variable | Beschreibung | Default |
|----------|--------------|---------|
| `DATABASE_PATH` | SQLite Dateipfad | `./data/llm-advisor.db` |
| `AUTH_SECRET` | API Auth Token | (leer = keine Auth) |
| `DASHBOARD_URL` | Dashboard URL für MCP | `http://localhost:3000` |
