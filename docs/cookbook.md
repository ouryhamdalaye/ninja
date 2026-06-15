# MCP Server Cookbook — Flight Search & Booking

A step-by-step guide to how this project was built. Written for juniors learning MCP.

We chose **TypeScript** for this repo, but the steps and ideas apply to **any language** that has an official MCP SDK (Python, Go, etc.). Swap the SDK package and runtime command; the MCP concepts stay the same.

---

## What we built

A small **MCP server** that lets an AI assistant (Cursor, Claude, etc.):

- **Search** flights between airports
- **Book** a flight and get a booking reference
- **Look up** or **cancel** a booking
- Read a list of **supported airports** (resource)
- Start a guided **trip planning** conversation (prompt)

The server talks to the host over **stdio**: the host launches our process and sends JSON-RPC messages on stdin; we reply on stdout. No HTTP server needed for local development.

---

## Before you start

You need:

1. **Node.js 20+** (or whatever runtime your language uses)
2. A basic idea of what MCP is: a standard way for an AI host to call **your** code as **tools**, read **resources**, and use **prompt templates**
3. An MCP-capable editor — we used **Cursor**

Official references:

- [MCP specification](https://modelcontextprotocol.io)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — we used this one
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk) — same ideas, different syntax

---

## Step 1 — Create an empty project

Create a folder and initialize a package manager project.

```bash
mkdir flight-mcp && cd flight-mcp
npm init -y
```

**Why:** An MCP server is just a long-running program. You need a normal project layout, dependency file, and a way to run an entry script.

In Python this would be `mkdir`, `python -m venv .venv`, and a `pyproject.toml` or `requirements.txt`. Same idea.

---

## Step 2 — Install the MCP SDK

Install the official server SDK for your language, plus anything the SDK documents as required.

For this project (TypeScript):

```bash
npm install @modelcontextprotocol/server zod
npm install @cfworker/json-schema   # required at runtime by the v2 alpha SDK
npm install -D typescript @types/node
```

**What each piece does:**

| Package | Role |
|---------|------|
| `@modelcontextprotocol/server` | MCP server library — register tools, resources, prompts, connect transport |
| `zod` | Describes tool inputs (SDK turns this into JSON Schema for the model) |
| `@cfworker/json-schema` | JSON Schema validation used internally by the SDK (peer dependency easy to miss) |

In **Python**, the equivalent is roughly:

```bash
pip install mcp
```

Always check the SDK README for your language version — peer dependencies differ.

---

## Step 3 — Learn the three MCP building blocks

Before writing code, know what you are exposing:

| Capability | What it is | Our example |
|------------|------------|-------------|
| **Tool** | A function the AI can call (with user approval) | `search-flights`, `book-flight` |
| **Resource** | Read-only data the AI can fetch | `flights://airports` — list of airport codes |
| **Prompt** | A pre-built message template to start a task | `plan-trip` — “help me search and book a flight” |

**Rule of thumb for juniors:**

- **Tool** = “do something” (search, book, cancel)
- **Resource** = “here is reference data” (airports, config, docs)
- **Prompt** = “start the conversation like this”

You do not need all three on day one. We added all three to show the full picture; one tool is enough to learn.

---

## Step 4 — Pick a transport: stdio

MCP supports several transports. For local dev, **stdio** is the default and simplest:

```
┌─────────────┐   stdin/stdout (JSON-RPC)   ┌──────────────┐
│  Cursor /   │ ◄──────────────────────────► │  Your MCP    │
│  Claude     │   spawn: node build/index.js │  server      │
└─────────────┘                              └──────────────┘
```

The host **starts your process** and owns the pipes. Your job:

1. Create a server instance (name + version)
2. Register tools / resources / prompts
3. Connect a **stdio transport**
4. Wait for messages

**Critical rule:** On stdio, **stdout is reserved for MCP protocol messages**. Log to **stderr** only (`console.error` in Node). Writing debug logs to stdout breaks the connection.

---

## Step 5 — Create the entry point

Every MCP server has the same skeleton:

```
1. Create server (identity: name, version)
2. Register capabilities (tools, resources, prompts)
3. Connect stdio transport
4. Run until the host closes the connection
```

Our entry file does exactly that: create `McpServer`, call register functions, connect `StdioServerTransport`, log “running on stdio” to stderr.

Keep this file thin. It should not contain business logic — only wiring.

---

## Step 6 — Add fake data (no real API yet)

For learning, we skipped external APIs and used **in-memory data**:

- A list of **airports** (CDG, JFK, LHR, …)
- A list of **flights** with route, date, price, seats
- An in-memory **bookings** map (created when someone books)

**Why mock data first:**

- You can test MCP wiring without API keys
- You control edge cases (no seats, unknown airport)
- Same pattern later: replace mock arrays with HTTP calls to Amadeus, Skyscanner, etc.

The data layer is plain application code — not MCP-specific.

---

## Step 7 — Walk through one tool end-to-end (`search-flights`)

This is the pattern every tool follows. Once you understand one, the others are copy-paste with different logic.

### 7.1 Choose a clear tool name

`search-flights` — kebab-case, verb-noun, describes what it does.

The model reads the **name** and **description** when deciding which tool to call. Be explicit.

### 7.2 Define the input schema

Tell the model exactly what arguments it can pass:

- `origin` — 3-letter airport code
- `destination` — 3-letter airport code
- `date` — optional, `YYYY-MM-DD`
- `passengers` — optional, default 1

Each field gets a **description**. Good descriptions = fewer wrong tool calls.

The SDK converts this schema to **JSON Schema** so the host and model know the contract.

### 7.3 Write the handler

The handler receives validated arguments and returns a **result** with **content blocks** (usually text):

```
Input:  { origin: "CDG", destination: "JFK", date: "2026-07-15", passengers: 1 }
Logic:  filter mock flights where route + date + seats match
Output: text listing matching flights (ID, airline, times, price, seats left)
```

On errors (unknown airport, no results), return a clear text message. For hard failures, mark the result as an error if your SDK supports it.

### 7.4 Register the tool on the server

Call the SDK’s register function with:

1. Tool name
2. Config (title, description, input schema)
3. Handler function

That’s it. The SDK handles JSON-RPC, validation, and dispatch.

### 7.5 Repeat the same pattern for other tools

`book-flight`, `get-booking`, and `cancel-booking` follow the same three steps: **schema → handler → register**. We did not do anything structurally different — only the business logic changes.

---

## Step 8 — Add one resource (optional but useful)

Resources expose **read-only data** via a URI.

We registered `flights://airports` so the model can discover valid airport codes before searching.

Pattern:

1. Pick a URI scheme (`flights://…`)
2. Register with name, URI, mime type
3. Handler returns the data when the host reads that URI

Resources are great for catalogs, config, and docs the model should not guess.

---

## Step 9 — Add one prompt (optional)

Prompts are **templates** that pre-fill a user message.

`plan-trip` takes origin, destination, date, passengers and builds a message like:

> “Help me plan and book a flight. Route: CDG → JFK. Use search-flights, then ask before booking.”

This nudges the model through a safe flow (search → confirm → book) instead of booking blindly.

---

## Step 10 — Organize the code

We split the project by responsibility:

```
src/
  index.*          → entry point, transport, wiring only
  data/            → mock flights, airports, bookings (your domain)
  tools/           → one file per tool (or group of related tools)
  resources/       → resource handlers
  prompts/         → prompt templates
```

You do not need this layout on day one. A single file with one tool is fine. Split when it gets hard to read.

---

## Step 11 — Build and run

Compile if your language needs it, then run the entry script:

```bash
npm run build
npm start
```

If it works, the process starts and waits — no crash, message on stderr. That is correct. The host will send the first MCP handshake when it connects.

---

## Step 12 — Connect the host (Cursor)

The MCP server is useless until a **host** knows how to launch it.

For **Cursor**, create `.cursor/mcp.json` in the project root:

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

| Field | Meaning |
|-------|---------|
| `mcpServers` | Root key Cursor expects (not `servers` — that is VS Code Copilot) |
| `flight-booking` | Display name; pick anything unique |
| `command` | Executable that starts your server |
| `args` | Path to your built entry file |

After saving: **reload MCP** in Cursor or restart the editor. Run `npm run build` first so the file in `args` exists.

**Other hosts:**

| Host | Config file | Root key |
|------|-------------|----------|
| Cursor | `.cursor/mcp.json` or `~/.cursor/mcp.json` | `mcpServers` |
| Claude Desktop | `claude_desktop_config.json` | `mcpServers` |
| VS Code Copilot | `.vscode/mcp.json` | `servers` |

Same server, different config shape.

---

## Step 13 — Test in chat

Try prompts that exercise the flow:

1. “Search flights from CDG to JFK on 2026-07-15”
2. “Book flight AF001 for Jane Doe, jane@example.com”
3. “Show my booking BK…”

If tools do not appear:

- Check MCP logs in the editor (connection errors)
- Confirm the build output path matches `mcp.json`
- Confirm you did not log to stdout

---

## Troubleshooting we hit

### `Property servers is not allowed` in `mcp.json`

Cursor expects `mcpServers`, not `servers`. VS Code uses `servers`. Use the right key for your host.

### `Cannot find package '@cfworker/json-schema'`

The TypeScript SDK v2 alpha lists this as an optional peer dependency but needs it at runtime:

```bash
npm install @cfworker/json-schema
```

### Connection closes immediately

Usually means the process crashed on startup. Run `node build/index.js` manually in a terminal and read the error on stderr.

---

## Mapping this to Python (or another language)

| Step | TypeScript (this repo) | Python (equivalent idea) |
|------|------------------------|---------------------------|
| Install SDK | `npm install @modelcontextprotocol/server` | `pip install mcp` |
| Create server | `new McpServer({ name, version })` | `Server("flight-booking")` or SDK equivalent |
| Stdio transport | `StdioServerTransport()` | `stdio_server()` context manager |
| Register tool | `server.registerTool(name, config, handler)` | `@server.tool()` decorator or `register_tool()` |
| Input schema | Zod object | Pydantic model or JSON Schema dict |
| Host config | `"command": "node", "args": [...]` | `"command": "python", "args": ["server.py"]` |

The **MCP protocol** is the same. Only the SDK syntax and runtime command change.

---

## What to learn next

1. **Replace mock data** with a real flight API (or a simple SQLite database)
2. **Add authentication** if the server ever runs remotely (HTTP transport + OAuth)
3. **Use MCP Inspector** to debug requests without the full editor
4. **Read one tool’s handler** in `src/tools/search-flights.*` — then implement your own tool from scratch without copying

---

## Mental model (one paragraph)

An MCP server is a **small program that advertises capabilities** (tools, resources, prompts) and **responds to JSON-RPC calls** over stdio. You write normal business logic; the SDK handles the protocol. The AI host launches your program, discovers what you offer, and calls your tools when the user asks. Your job as a junior: **define clear schemas**, **return readable text results**, **never break stdout on stdio**, and **wire the host config** so the editor can find your server.
