import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { getBooking, saveBooking } from "../data/bookings.js";
import { FLIGHTS } from "../data/mock-flights.js";

export function registerCheckInTool(server: McpServer): void {
    server.registerTool(
        "check-in",
        {
            title: "Check In",
            description: "Check in a booking",
            inputSchema: z.object({
                bookingId: z.string().describe("Booking ID"),
            }),
        },
        async ({ bookingId }) => {
            const booking = getBooking(bookingId);
            if (!booking) {
                return {
                    content: [{ type: "text" as const, text: `Booking ${bookingId} not found` }],
                    isError: true,
                };
            }
            if(booking.status !== "confirmed") {
                return {
                    content: [{ type: "text" as const, text: `Booking ${bookingId} is not confirmed` }],
                    isError: true,
                };
            }
            if(booking.checkedIn) {
                return {    
                    content: [{ type: "text" as const, text: `Booking ${bookingId} is already checked in` }],
                    isError: true,
                };
            }
            booking.checkedIn = true;
            // generate boardingPasscode BP-6 random characters
            const boardingPassCode = "BP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            booking.boardingPassCode = boardingPassCode;
            saveBooking(booking);

            // get flight from flightId
            const flight = FLIGHTS.find((item) => item.id === booking.flightId);
            if (!flight) {
                return {
                    content: [{ type: "text" as const, text: `Flight ${booking.flightId} not found` }],
                    isError: true,
                };
            }

            // formater la réponse
            return {
                content: [{ type: "text" as const, text: [
                    `Booking ID: ${booking.id}`,
                    `Flight: ${flight.airline} ${flight.origin} → ${flight.destination} on ${flight.departureDate}`,
                    `Passenger: ${booking.passengerName}`,
                    `Seat: ${booking.seat}`,
                    `Boarding pass: ${boardingPassCode}`,
                ].join("\n"), }],
            };
        },
    );
}