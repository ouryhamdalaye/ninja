import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import {
  createBookingId,
  saveBooking,
} from "../data/bookings.js";
import { FLIGHTS } from "../data/mock-flights.js";

export function registerBookFlightTool(server: McpServer): void {
  server.registerTool(
    "book-flight",
    {
      title: "Book Flight",
      description:
        "Book a flight by ID. Returns a booking reference you can look up later.",
      inputSchema: z.object({
        flightId: z.string().describe("Flight ID from search-flights results"),
        passengerName: z.string().min(2).describe("Full name of the lead passenger"),
        passengerEmail: z.string().email().describe("Contact email for the booking"),
        passengers: z
          .number()
          .int()
          .min(1)
          .max(9)
          .default(1)
          .describe("Number of passengers to book"),
      }),
    },
    async ({ flightId, passengerName, passengerEmail, passengers }) => {
      const flight = FLIGHTS.find(
        (item) => item.id.toUpperCase() === flightId.toUpperCase(),
      );

      if (!flight) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Flight ${flightId} not found. Run search-flights first.`,
            },
          ],
          isError: true,
        };
      }

      if (flight.seatsAvailable < passengers) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Not enough seats on ${flight.id}. Only ${flight.seatsAvailable} seat(s) left.`,
            },
          ],
          isError: true,
        };
      }

      flight.seatsAvailable -= passengers;

      const booking = {
        id: createBookingId(),
        flightId: flight.id,
        passengerName,
        passengerEmail,
        passengers,
        totalPrice: flight.pricePerPassenger * passengers,
        currency: flight.currency,
        status: "confirmed" as const,
        bookedAt: new Date().toISOString(),
      };

      saveBooking(booking);

      return {
        content: [
          {
            type: "text" as const,
            text: [
              "Booking confirmed!",
              `Booking ID: ${booking.id}`,
              `Flight: ${flight.airline} ${flight.origin} → ${flight.destination}`,
              `Date: ${flight.departureDate} at ${flight.departureTime}`,
              `Passengers: ${passengers}`,
              `Total: ${booking.totalPrice} ${booking.currency}`,
            ].join("\n"),
          },
        ],
      };
    },
  );
}
