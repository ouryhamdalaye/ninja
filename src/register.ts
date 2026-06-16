import type { McpServer } from "@modelcontextprotocol/server";

import { registerTools } from "./tools/index.js";
import { registerPrompts } from "./prompts/index.js";
import { registerResources } from "./resources/index.js";

export function registerAll(server: McpServer): void {
  registerTools(server);
  registerResources(server);
  registerPrompts(server);
}

export { registerTools };
