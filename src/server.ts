import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// NOTE: tools/resources/prompts are registered from index.ts, not here.
// ES module imports are hoisted above all other code in a file, so if this
// module imported them itself, they would run before `server` below is
// assigned and crash with "Cannot access 'server' before initialization".
export const server = new McpServer({
  name: "mcp-learning",
  version: "0.1.0",
});

