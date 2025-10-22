#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// API configuration
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface GenerateContentRequest {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  tools: Array<{
    googleMaps: {
      enableWidget?: boolean;
    };
  }>;
  toolConfig?: {
    retrievalConfig?: {
      latLng?: LatLng;
    };
  };
}

interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
    placeId: string;
  };
}

interface GroundingSupport {
  groundingChunkIndices: number[];
  confidenceScores: number[];
  segment: {
    startIndex: number;
    endIndex: number;
    text: string;
  };
}

interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  googleMapsWidgetContextToken?: string;
}

interface GenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    groundingMetadata?: GroundingMetadata;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

async function queryMapsGrounding(
  query: string,
  latitude?: number,
  longitude?: number,
  model: string = DEFAULT_MODEL,
  enableWidget: boolean = false
): Promise<GenerateContentResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable is required");
  }

  const requestBody: GenerateContentRequest = {
    contents: [
      {
        parts: [{ text: query }],
      },
    ],
    tools: [
      {
        googleMaps: {
          enableWidget,
        },
      },
    ],
  };

  // Add location context if provided
  if (latitude !== undefined && longitude !== undefined) {
    requestBody.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude,
          longitude,
        },
      },
    };
  }

  const url = `${API_BASE_URL}/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Maps Grounding API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "google_maps_search",
    description:
      "Search for places, restaurants, businesses, or get location-based information using Google Maps with Gemini AI. Returns AI-generated responses with grounding metadata including place details, URIs, and place IDs.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query (e.g., 'Italian restaurants nearby', 'coffee shops in San Francisco', 'hotels near Times Square')",
        },
        latitude: {
          type: "number",
          description:
            "Latitude for location context (optional, but recommended for 'nearby' searches)",
        },
        longitude: {
          type: "number",
          description:
            "Longitude for location context (optional, but recommended for 'nearby' searches)",
        },
        model: {
          type: "string",
          description:
            "Gemini model to use (default: gemini-2.5-flash). Options: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash",
          default: DEFAULT_MODEL,
        },
        enableWidget: {
          type: "boolean",
          description:
            "Enable interactive map widget in response (default: false)",
          default: false,
        },
      },
      required: ["query"],
    },
  },
];

// Create and configure the server
const server = new Server(
  {
    name: "google-maps-grounding",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "google_maps_search") {
    const query = args?.query as string;
    const latitude = args?.latitude as number | undefined;
    const longitude = args?.longitude as number | undefined;
    const model = (args?.model as string) || DEFAULT_MODEL;
    const enableWidget = (args?.enableWidget as boolean) || false;

    if (!query) {
      throw new Error("query parameter is required");
    }

    try {
      const response = await queryMapsGrounding(
        query,
        latitude,
        longitude,
        model,
        enableWidget
      );

      // Format the response for better readability
      const candidate = response.candidates[0];
      const text = candidate.content.parts[0].text;
      const groundingMetadata = candidate.groundingMetadata;

      let formattedResponse = `## Response\n\n${text}\n\n`;

      // Add grounding sources if available
      if (groundingMetadata?.groundingChunks) {
        formattedResponse += "## Sources\n\n";
        groundingMetadata.groundingChunks.forEach((chunk, index) => {
          if (chunk.maps) {
            formattedResponse += `${index + 1}. **${chunk.maps.title}**\n`;
            formattedResponse += `   - Place ID: ${chunk.maps.placeId}\n`;
            formattedResponse += `   - URL: ${chunk.maps.uri}\n\n`;
          }
        });
      }

      // Add widget token if available
      if (groundingMetadata?.googleMapsWidgetContextToken) {
        formattedResponse += `## Map Widget Token\n\n${groundingMetadata.googleMapsWidgetContextToken}\n\n`;
      }

      // Add usage metadata if available
      if (response.usageMetadata) {
        formattedResponse += `## Usage\n\n`;
        formattedResponse += `- Prompt tokens: ${response.usageMetadata.promptTokenCount}\n`;
        formattedResponse += `- Response tokens: ${response.usageMetadata.candidatesTokenCount}\n`;
        formattedResponse += `- Total tokens: ${response.usageMetadata.totalTokenCount}\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Maps Grounding MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
