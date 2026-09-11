import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { server } from "../server.js";
import { readJiraTicket, ticketKeySchema } from "../lib/jira.js";

server.resource(
  "jira_ticket",
  new ResourceTemplate("jira://tickets/{ticketKey}", { list: undefined }),
  {
    description: "Reads a Jira ticket by key as a JSON document without modifying it.",
    mimeType: "application/json",
  },
  async (uri, { ticketKey }) => {
    const ticket = await readJiraTicket(ticketKeySchema.parse(ticketKey));
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(ticket, null, 2),
      }],
    };
  }
);
