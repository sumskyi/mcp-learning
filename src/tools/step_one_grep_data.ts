import { z } from "zod";
import { server } from "../server.js";

// First link of our Unix-style pipeline
server.tool(
  "step_one_grep_data",
  "Takes raw text and extracts an ID from it for the next command",
  {
    rawText: z.string().describe("Raw data or log to parse"),
  },
  async ({ rawText }) => {
    // Real logic goes here (e.g. a call to the Rails API)
    // For now we just fake the pipe output
    const generatedId = `ID-${Math.floor(Math.random() * 10000)}`;

    return {
      content: [
        {
          type: "text",
          text: `[Pipe Output]: Found object in "${rawText}" with ${generatedId}. Pass this ID to the next service.`,
        },
      ],
    };
  }
);
