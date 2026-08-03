import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

// Registering tools/resources/prompts here (after `server` is fully
// initialized) avoids the circular-import crash described in server.ts.
import "./tools/index.js";
import "./resources/index.js";
import "./prompts/index.js";

async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Write only to stderr!
  // stdout is used by the MCP protocol.
  console.error("MCP server started");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

