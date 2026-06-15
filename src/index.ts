#!/usr/bin/env node

import { McpServer, StdioServerTransport } from "@modelcontextprotocol/server";

import { registerAll } from "./register.js";

const server = new McpServer({
  name: "flight-booking",
  version: "0.1.0",
});

registerAll(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Flight Booking MCP server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
