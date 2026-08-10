import { z } from "zod";
import { server } from "../server.js";
import { startWork } from "../lib/start-work/orchestrator.js";

server.tool(
  "start_work",
  "Starts work on a Jira ticket: moves it to In Progress, creates a branch in every target repo, bumps versions, bootstraps task files, and opens pull requests.",
  {
    ticketKey: z.string().describe("Jira ticket key, e.g. NOTE-3456"),
  },
  async ({ ticketKey }) => {
    const report = await startWork(ticketKey);

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
