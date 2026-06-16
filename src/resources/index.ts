import type { McpServer } from "@modelcontextprotocol/server";

import { registerAirportsResource } from "./airports.js";
import { registerBaggagePolicyResource } from "./baggage-policy.js";

export function registerResources(server: McpServer): void {
    registerAirportsResource(server);
    registerBaggagePolicyResource(server);
}