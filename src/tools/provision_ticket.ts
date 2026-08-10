import { z } from "zod";
import { server } from "../server.js";
import { provisionTicket } from "../lib/provision-ticket/orchestrator.js";

server.tool(
  "provision_ticket",
  "Provisions a Jira ticket for work: moves it to In Progress, creates a branch in the given repos, sets versions, bootstraps task files, and opens pull requests.",
  {
    ticketKey: z.string().describe("Jira ticket key, e.g. NOTE-3456"),
    repos: z
      .array(z.string())
      .min(1)
      .describe(
        "Repos this ticket touches, e.g. [\"notetaking-ng\", \"notetaking-webserver-simulator\"]. " +
          "Only these get a branch/version/PR — never assume every ticket touches every repo."
      ),
    versions: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "Map of repo name -> exact version to set (e.g. { \"notetaking-ng\": \"0.14.0\" }). " +
          "The version is decided by the ticket owner, not computed here. Omit a repo to leave its version untouched."
      ),
  },
  async ({ ticketKey, repos, versions }) => {
    const report = await provisionTicket(ticketKey, repos, versions);

    return {
      content: [
        {
          type: "text",
          text: report,
        },
      ],
    };
  }
);
