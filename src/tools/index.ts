import type { McpServer } from "@modelcontextprotocol/server";

import { registerBookFlightTool } from "./book-flight.js";
import {
  registerCancelBookingTool,
  registerGetBookingTool,
} from "./get-booking.js";
import { registerSearchFlightsTool } from "./search-flights.js";
import { registerAddBaggageTool } from "./add-baggage.js";
import { registerCheckInTool } from "./check-in.js";

export function registerTools(server: McpServer): void {
  registerSearchFlightsTool(server);
  registerBookFlightTool(server);
  registerGetBookingTool(server);
  registerCancelBookingTool(server);
  registerAddBaggageTool(server);
  registerCheckInTool(server);
}
