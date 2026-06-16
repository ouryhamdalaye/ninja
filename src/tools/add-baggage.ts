import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import { addBaggage } from "../data/baggage.js";


export function registerAddBaggageTool(server: McpServer): void {
    server.registerTool(
        "add-baggage",
        {
            title: "Add Baggage",
            description: "Add baggage to a booking",
            inputSchema: z.object({
                bookingId: z.string().describe("Booking ID"),
                baggage: z.int().min(1).describe("Number of bags to add"),
            }),
        },
        async ({ bookingId, baggage }) => {
            const result = addBaggage(bookingId, baggage);
            if (!result.ok) {
                return {
                    content: [{ type: "text" as const, text: result.message }],
                    isError: true,
                };
            }

            return {
                content: [
                    { 
                      type: "text" as const,
                      text: `Baggage added to booking ${result.bookingId}. Total baggage count: ${result.baggageCount}. Total baggage fee: ${result.baggageFee}`
                   }
                ],
            }
        },
    );
}