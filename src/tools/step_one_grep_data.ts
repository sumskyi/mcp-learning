import { z } from "zod";
import { server } from "../server.js";
import { extractIdFromRawText } from "../lib/extract_id_from_raw_text.js";

// First link of our Unix-style pipeline
server.tool(
  "step_one_grep_data",
  "Takes raw text and extracts an ID from it for the next command",
  {
    rawText: z.string().describe("Raw data or log to parse"),
  },
  async ({ rawText }) => {
    const extractedId = extractIdFromRawText(rawText);

    return {
      content: [
        {
          type: "text",
          text: `[Pipe Output]: Found object in "${rawText}" with ${extractedId}. Pass this ID to the next service.`,
        },
      ],
    };
  }
);
