import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Писати тільки в stderr!
  // stdout використовується MCP-протоколом.
  console.error("MCP server started");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

