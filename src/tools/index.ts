import type { McpServer } from "@modelcontextprotocol/server";

import { registerPlanTripPrompt } from "../prompts/plan-trip.js";
import { registerAirportsResource } from "../resources/airports.js";
import { registerBookFlightTool } from "./book-flight.js";
import {
  registerCancelBookingTool,
  registerGetBookingTool,
} from "./get-booking.js";
import { registerSearchFlightsTool } from "./search-flights.js";

export function registerTools(server: McpServer): void {
  registerSearchFlightsTool(server);
  registerBookFlightTool(server);
  registerGetBookingTool(server);
  registerCancelBookingTool(server);
}

export function registerResources(server: McpServer): void {
  registerAirportsResource(server);
}

export function registerPrompts(server: McpServer): void {
  registerPlanTripPrompt(server);
}
