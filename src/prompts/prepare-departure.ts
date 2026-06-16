import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

export function registerPrepareDeparturePrompt(server: McpServer): void {
    server.registerPrompt(
        "prepare-departure",
        {
            title: "Prepare Departure",
            description: "Prepare for departure",
            argsSchema: z.object({
                bookingId: z.string().min(1).describe("Booking ID"),
            }),
        },
        ({ bookingId }) => ({
                messages: [
                    {
                        role: "user" as const,
                        content: {
                            type: "text" as const,
                            text: [
                                "Prepare for departure",
                                `Booking ID: ${bookingId}`,
                                "Steps:",
                                "1. Load the booking with `get-booking`",
                                "2. Read `flights://baggage-policy`",
                                "3. If needed, use add-baggage after passenger confirmation",
                                "4. Only do the check-in **after** passenger confirmation",
                                "5. Display the boarding pass",
                            ].join("\n"),
                        },
                    },
                ],
        }),
    );
}