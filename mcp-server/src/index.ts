import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { listCategoriesDefinition, listCategories } from "./tools/list-categories.js";
import { getModelDefinition, getModel, type GetModelInput } from "./tools/get-model.js";

// MCP Server erstellen
const server = new Server(
  {
    name: "llm-advisor",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tools auflisten
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [listCategoriesDefinition, getModelDefinition],
  };
});

// Tool aufrufen
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_categories": {
        const result = await listCategories();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_model": {
        const input = args as unknown as GetModelInput;
        if (!input.category) {
          throw new Error("Parameter 'category' ist erforderlich");
        }
        const result = await getModel(input);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unbekanntes Tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: message }),
        },
      ],
      isError: true,
    };
  }
});

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LLM Advisor MCP Server gestartet");
}

main().catch((error) => {
  console.error("Fehler beim Starten des MCP Servers:", error);
  process.exit(1);
});
