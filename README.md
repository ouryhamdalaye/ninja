# 🥷 Ninja — MCP branch

This branch (`mcp`) is a learning lab for the [Model Context Protocol](https://modelcontextprotocol.io). It hosts a small **flight search & booking MCP server** written in TypeScript — a skeleton project to practice tools, resources, and prompts with an AI host like Cursor.

The parent [Ninja](https://github.com/ouryhamdalaye/ninja) repo is a personal dev dojo for experiments; this branch focuses on MCP only.

## What it does

An MCP server named `flight-booking` that runs over **stdio**. The host launches the process and talks JSON-RPC on stdin/stdout — no HTTP server needed for local dev.

| Capability | Name | Description |
|------------|------|-------------|
| Tool | `search-flights` | Search flights by origin, destination, and date |
| Tool | `book-flight` | Book a flight and get a booking reference |
| Tool | `get-booking` | Look up an existing booking |
| Tool | `cancel-booking` | Cancel a booking |
| Resource | `airports` | List of supported IATA airport codes |
| Prompt | `plan-trip` | Guided trip-planning conversation starter |

Data is mocked in memory — this is for learning MCP patterns, not production booking.

## Quick start

**Requirements:** Node.js 20+

```bash
npm install
npm run build
npm start
```

## Use with Cursor

After building, add the server in `.cursor/mcp.json` (already configured in this repo):

```json
{
  "mcpServers": {
    "flight-booking": {
      "command": "node",
      "args": ["${workspaceFolder}/build/index.js"]
    }
  }
}
```

Restart Cursor (or reload MCP servers), then ask the agent things like:

> Search flights from CDG to JFK on 2026-07-15

## Project structure

```
src/
├── index.ts              # Server entry point
├── register.ts           # Wires tools, resources, and prompts onto the server
├── tools/                # MCP tools (search, book, get, cancel)
├── resources/            # MCP resources (airports list)
├── prompts/              # MCP prompts (plan-trip)
└── data/                 # Mock flights, airports, bookings
docs/
└── cookbook.md           # Step-by-step build guide
```

## Learn more

See [docs/cookbook.md](docs/cookbook.md) for a full walkthrough of how this server was built — from empty project to working MCP integration.

## Author

ODI Hamd
