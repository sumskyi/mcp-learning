import { server } from "../server.js";
import { readJiraTicket, ticketKeySchema } from "../lib/jira.js";

server.tool(
  "read_jira_ticket",
  "Reads a Jira ticket's summary, description, status, and assignee without modifying it.",
  { ticketKey: ticketKeySchema.describe("Jira ticket key, e.g. NOTE-3456") },
  { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
  async ({ ticketKey }) => {
    try {
      const ticket = await readJiraTicket(ticketKey);
      return { content: [{ type: "text", text: JSON.stringify(ticket, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : "Failed to read Jira ticket." }],
      };
    }
  }
);
