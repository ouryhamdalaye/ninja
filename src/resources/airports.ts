import type { McpServer } from "@modelcontextprotocol/server";

import { AIRPORTS } from "../data/airports.js";

export function registerAirportsResource(server: McpServer): void {
  server.registerResource(
    "airports",
    "flights://airports",
    {
      title: "Supported Airports",
      description: "List of airport codes available in this demo flight catalog.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(AIRPORTS, null, 2),
        },
      ],
    }),
  );
}
