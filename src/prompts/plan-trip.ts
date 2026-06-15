import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

export function registerPlanTripPrompt(server: McpServer): void {
  server.registerPrompt(
    "plan-trip",
    {
      title: "Plan a Trip",
      description:
        "Start a structured conversation to search and book a flight.",
      argsSchema: z.object({
        origin: z.string().describe("Departure city or airport code"),
        destination: z.string().describe("Arrival city or airport code"),
        date: z.string().optional().describe("Preferred departure date (YYYY-MM-DD)"),
        passengers: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Number of travelers"),
      }),
    },
    ({ origin, destination, date, passengers = 1 }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "Help me plan and book a flight.",
              `Route: ${origin} → ${destination}`,
              date ? `Date: ${date}` : "Date: flexible",
              `Passengers: ${passengers}`,
              "",
              "Steps:",
              "1. Read flights://airports if airport codes are unclear.",
              "2. Use search-flights to find options.",
              "3. Ask me to confirm before calling book-flight.",
              "4. Share the booking ID after confirmation.",
            ].join("\n"),
          },
        },
      ],
    }),
  );
}
