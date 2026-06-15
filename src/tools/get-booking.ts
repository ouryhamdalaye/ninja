import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import { cancelBooking, getBooking } from "../data/bookings.js";
import { FLIGHTS } from "../data/mock-flights.js";

function formatBookingDetails(booking: NonNullable<ReturnType<typeof getBooking>>): string {
  const flight = FLIGHTS.find((item) => item.id === booking.flightId);

  return [
    `Booking ID: ${booking.id}`,
    `Status: ${booking.status}`,
    `Passenger: ${booking.passengerName} (${booking.passengerEmail})`,
    `Passengers: ${booking.passengers}`,
    `Total paid: ${booking.totalPrice} ${booking.currency}`,
    `Booked at: ${booking.bookedAt}`,
    flight
      ? `Flight: ${flight.airline} ${flight.origin} → ${flight.destination} on ${flight.departureDate}`
      : `Flight ID: ${booking.flightId}`,
  ].join("\n");
}

export function registerGetBookingTool(server: McpServer): void {
  server.registerTool(
    "get-booking",
    {
      title: "Get Booking",
      description: "Look up a booking by its reference ID.",
      inputSchema: z.object({
        bookingId: z.string().describe("Booking ID returned by book-flight"),
      }),
    },
    async ({ bookingId }) => {
      const booking = getBooking(bookingId);

      if (!booking) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No booking found for ID ${bookingId}.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: formatBookingDetails(booking),
          },
        ],
      };
    },
  );
}

export function registerCancelBookingTool(server: McpServer): void {
  server.registerTool(
    "cancel-booking",
    {
      title: "Cancel Booking",
      description: "Cancel an existing confirmed booking.",
      inputSchema: z.object({
        bookingId: z.string().describe("Booking ID to cancel"),
      }),
    },
    async ({ bookingId }) => {
      const booking = cancelBooking(bookingId);

      if (!booking) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Could not cancel booking ${bookingId}. It may not exist or is already cancelled.`,
            },
          ],
          isError: true,
        };
      }

      const flight = FLIGHTS.find((item) => item.id === booking.flightId);
      if (flight) {
        flight.seatsAvailable += booking.passengers;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Booking ${booking.id} has been cancelled.\n\n${formatBookingDetails(booking)}`,
          },
        ],
      };
    },
  );
}
