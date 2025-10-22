# BoringMarketer Guides

A collection of tools, examples, and guides for market research and competitive intelligence using AI and automation.

## Google Maps MCP Server

A Model Context Protocol (MCP) server that provides access to Google's Maps Grounding API with Gemini AI. Search for places, restaurants, businesses, and get location-based information with AI-generated responses backed by Google Maps data.

### Features

- AI-Powered Maps Search with natural language queries
- Location-aware searches using latitude/longitude
- Grounding metadata with place IDs, URIs, and structured data
- Support for multiple Gemini models
- Interactive map widgets

[View the full documentation](./google-maps-mcp-server/README.md)

### Quick Start

```bash
cd google-maps-mcp-server
npm install
npm run build
```

Configure in your Claude Code or MCP-compatible client:

```json
{
  "mcpServers": {
    "google-maps-grounding": {
      "command": "node",
      "args": ["/path/to/google-maps-mcp-server/build/index.js"],
      "env": {
        "GOOGLE_GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Examples

### Austin Pool Market Report

A real-world example of using the Google Maps MCP server to research local markets and generate competitive intelligence reports.

[View the report](./examples/austin-pool-market-report.html)

This example demonstrates:
- Market research with Google Maps data
- Competitive landscape analysis
- Review volume comparison
- Geographic coverage insights
- Actionable recommendations

## Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or select a project
3. Generate an API key
4. Enable the Gemini API for your project

## Resources

- [Google Maps Grounding Documentation](https://ai.google.dev/gemini-api/docs/maps-grounding)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google AI Studio](https://aistudio.google.com/)

## Contributing

Have ideas or improvements? Open an issue or submit a pull request!

## License

MIT
