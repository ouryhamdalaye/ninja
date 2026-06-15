import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import { FLIGHTS } from "../data/mock-flights.js";
import { findAirport } from "../data/airports.js";

function formatFlight(flight: (typeof FLIGHTS)[number]): string {
  return [
    `ID: ${flight.id}`,
    `${flight.airline}: ${flight.origin} → ${flight.destination}`,
    `Date: ${flight.departureDate} ${flight.departureTime}–${flight.arrivalTime}`,
    `Duration: ${flight.durationMinutes} min`,
    `Price: ${flight.pricePerPassenger} ${flight.currency}/passenger`,
    `Seats left: ${flight.seatsAvailable}`,
  ].join("\n");
}

export function registerSearchFlightsTool(server: McpServer): void {
  server.registerTool(
    "search-flights",
    {
      title: "Search Flights",
      description:
        "Search available flights by origin, destination, and optional departure date.",
      inputSchema: z.object({
        origin: z
          .string()
          .length(3)
          .describe("IATA airport code for departure (e.g. CDG, JFK)"),
        destination: z
          .string()
          .length(3)
          .describe("IATA airport code for arrival (e.g. LHR, LAX)"),
        date: z
          .string()
          .optional()
          .describe("Departure date in YYYY-MM-DD format"),
        passengers: z
          .number()
          .int()
          .min(1)
          .max(9)
          .default(1)
          .describe("Number of passengers"),
      }),
    },
    async ({ origin, destination, date, passengers }) => {
      const from = origin.toUpperCase();
      const to = destination.toUpperCase();

      if (!findAirport(from) || !findAirport(to)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Unknown airport code. Use the flights://airports resource to see supported airports.",
            },
          ],
          isError: true,
        };
      }

      const results = FLIGHTS.filter((flight) => {
        const matchesRoute =
          flight.origin === from && flight.destination === to;
        const matchesDate = date ? flight.departureDate === date : true;
        const hasSeats = flight.seatsAvailable >= passengers;
        return matchesRoute && matchesDate && hasSeats;
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No flights found for ${from} → ${to}${date ? ` on ${date}` : ""} with ${passengers} passenger(s).`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Found ${results.length} flight(s):\n\n${results.map(formatFlight).join("\n\n---\n\n")}`,
          },
        ],
      };
    },
  );
}
