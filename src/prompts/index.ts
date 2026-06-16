import type { McpServer } from "@modelcontextprotocol/server";

import { registerPrepareDeparturePrompt } from "./prepare-departure.js";
import { registerPlanTripPrompt } from "./plan-trip.js";

export function registerPrompts(server: McpServer): void {
    registerPrepareDeparturePrompt(server);
    registerPlanTripPrompt(server);
}