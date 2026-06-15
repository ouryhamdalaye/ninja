import type { McpServer } from "@modelcontextprotocol/server";

import { registerPlanTripPrompt } from "./prompts/plan-trip.js";
import { registerAirportsResource } from "./resources/airports.js";
import { registerTools } from "./tools/index.js";

export function registerAll(server: McpServer): void {
  registerTools(server);
  registerResources(server);
  registerPrompts(server);
}

export function registerResources(server: McpServer): void {
  registerAirportsResource(server);
}

export function registerPrompts(server: McpServer): void {
  registerPlanTripPrompt(server);
}

export { registerTools };
