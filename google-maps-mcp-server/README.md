# Google Maps Grounding MCP Server

An MCP (Model Context Protocol) server that provides access to Google's Maps Grounding API with Gemini AI. This allows you to search for places, restaurants, businesses, and get location-based information with AI-generated responses backed by Google Maps data.

## Features

- **AI-Powered Maps Search**: Use natural language queries to search Google Maps
- **Location Context**: Provide latitude/longitude for location-aware searches
- **Grounding Metadata**: Get place IDs, URIs, and structured data from Google Maps
- **Multiple Models**: Support for Gemini 2.5 Pro, Flash, Flash-Lite, and 2.0 Flash
- **Interactive Widgets**: Optional map widget tokens for visual representations

## Installation

### Prerequisites

- Node.js 18 or higher
- A Google Cloud API key with Gemini API access enabled
- Maps Grounding API access (note: $25 per 1K grounded prompts)

### Setup

1. Clone or navigate to this directory:
```bash
cd google-maps-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Configuration

### Get Your Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or select a project
3. Generate an API key
4. Enable the Gemini API for your project

### Add to Claude Code

Add the following configuration to your `~/.cursor/mcp.json` or Claude Code configuration file:

```json
{
  "mcpServers": {
    "google-maps-grounding": {
      "command": "npx",
      "args": [
        "-y",
        "server-google-maps-grounding"
      ],
      "env": {
        "GOOGLE_GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Or if you want to run it locally during development:

```json
{
  "mcpServers": {
    "google-maps-grounding": {
      "command": "node",
      "args": [
        "/path/to/google-maps-mcp-server/build/index.js"
      ],
      "env": {
        "GOOGLE_GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Usage

Once configured, you can use the Google Maps Grounding tool in Claude Code:

### Example Queries

**Find nearby restaurants:**
```
Find Italian restaurants near me
(with latitude: 34.050481, longitude: -118.248526)
```

**Search in a specific city:**
```
What are the best coffee shops in San Francisco?
(with latitude: 37.7749, longitude: -122.4194)
```

**General location queries:**
```
Tell me about tourist attractions in Paris
```

**Business information:**
```
Find hotels near Times Square
(with latitude: 40.7580, longitude: -73.9855)
```

## API Tool

### `google_maps_search`

Search for places and get AI-generated responses with Google Maps grounding.

**Parameters:**

- `query` (string, required): The search query
- `latitude` (number, optional): Latitude for location context
- `longitude` (number, optional): Longitude for location context
- `model` (string, optional): Gemini model to use (default: "gemini-2.5-flash")
  - Options: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash`
- `enableWidget` (boolean, optional): Enable interactive map widget token (default: false)

**Response Format:**

The tool returns a formatted response including:
- AI-generated text response
- Sources with place names, place IDs, and Google Maps URIs
- Map widget token (if enabled)
- Token usage statistics

## Development

### Watch Mode

Run TypeScript in watch mode during development:
```bash
npm run watch
```

### Local Testing

You can test the server locally by running:
```bash
GOOGLE_GEMINI_API_KEY=your_key_here node build/index.js
```

## Pricing

Google Maps Grounding charges **$25 per 1,000 grounded prompts**. You're only charged when the response contains at least one Maps source. Regular Gemini API charges may also apply.

## Supported Models

- `gemini-2.5-pro` - Most capable, best for complex queries
- `gemini-2.5-flash` (default) - Balanced performance and speed
- `gemini-2.5-flash-lite` - Fastest, for simple queries
- `gemini-2.0-flash` - Previous generation

## Troubleshooting

### "GOOGLE_GEMINI_API_KEY environment variable is required"

Make sure you've set the API key in your MCP configuration file.

### API Errors

Check that:
1. Your API key is valid
2. The Gemini API is enabled in your Google Cloud project
3. You have billing enabled (Maps Grounding is a paid feature)
4. You haven't exceeded your quota

### TypeScript Errors

Run `npm run build` to recompile after making changes.

## License

MIT

## Resources

- [Google Maps Grounding Documentation](https://ai.google.dev/gemini-api/docs/maps-grounding)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google AI Studio](https://aistudio.google.com/)
