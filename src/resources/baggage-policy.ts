import type { McpServer } from "@modelcontextprotocol/server";

import { BAGGAGE_POLICY } from "../data/baggage-policy.js";

export function registerBaggagePolicyResource(server: McpServer): void {
    server.registerResource(
        "baggage-policy",
        "flights://baggage-policy",
        {
            title: "Baggage Policy",
            description: "Baggage policy for the flights",
            mimeType: "application/json",
        },
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: "application/json",
                    text: JSON.stringify(BAGGAGE_POLICY, null, 2),
                },
            ],
        }),
    )
}