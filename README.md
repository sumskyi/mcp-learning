# mcp-learning

A learning project for building an MCP (Model Context Protocol) server in
TypeScript, using `@modelcontextprotocol/sdk` and `zod`.

See [AGENTS.md](AGENTS.md) for project structure and conventions.

## Requirements

- Node.js 22 or newer
- npm

## Install

```bash
npm install
```

## Running the server

During development, run the server directly from TypeScript source (no build step):

```bash
npm run dev
```

For a production-style run, compile first, then run the compiled output:

```bash
npm run build
npm start
```

The server communicates over stdio (stdin/stdout), following the MCP protocol —
it's not a network server you open in a browser directly. It's meant to be
launched by an MCP client (an IDE, an agent, or the Inspector tool below).

## MCP concepts

The same Jira ticket can illustrate three different MCP mechanisms:

| Mechanism | Example | Purpose |
| --- | --- | --- |
| **Tool** | `read_jira_ticket(ticketKey)` | Execute an operation that reads a ticket and returns its data. |
| **Resource** | `jira://tickets/NOTE-3456` | Read a ticket by URI as a document to include in the AI's context. |
| **Prompt** | `analyze_jira_ticket(ticketKey)` | Prepare ticket data and instructions for the AI to analyze it. |

All three examples above are implemented. Resources can load current data
from an API; they do not have to be static files.

In this project, the tool, resource, and prompt fetch the ticket from Jira.
The tool and resource return the data, while the prompt returns messages
containing the data and analysis instructions. None invokes an AI model: the MCP client passes
the messages to a model when an analysis is needed.

## Using the server

The server only exposes tools/resources/prompts to MCP clients — it has no
UI of its own. To interact with it manually, use the
[MCP Inspector](https://github.com/modelcontextprotocol/inspector), already
set up as a dev dependency.

### From the browser

```bash
npm run inspect
```

This opens a local web UI (URL with an auth token is printed to the console)
where you can see all registered tools, fill in their parameters through a
form, and call them.

### From the console (CLI)

```bash
npm run inspect:cli -- --method tools/call \
  --tool-name read_jira_ticket \
  --tool-arg ticketKey="NOTE-3456"
```

Note the `--` after `inspect:cli` — it tells npm to forward everything after
it to the underlying command instead of parsing it as npm's own flags.

Arguments can also be passed as a single JSON object instead of `key=value`
pairs:

```bash
npm run inspect:cli -- --method tools/call \
  --tool-name read_jira_ticket \
  --tool-args-json '{"ticketKey":"NOTE-3456"}'
```

To just list the available tools without calling one:

```bash
npm run inspect:cli -- --method tools/list
```

## Available tools

- `read_jira_ticket` reads a Jira ticket by key without modifying it.
  Requires the Jira environment variables described below.
  ([src/tools/read_jira_ticket.ts](src/tools/read_jira_ticket.ts)).

## Reading Jira tickets

`read_jira_ticket` reads a Jira Cloud ticket by key and returns its key,
summary, description (Jira wiki text), status, and assignee as JSON text.
It does not modify the ticket. Comments and attachments are not fetched.

Set these variables in a `.env` file in the project root, or in the MCP
client's server `env` settings:

```text
JIRA_BASE_URL=https://your-team.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-api-token
```

Use an Atlassian API token, not your account password. For a scoped token,
set `JIRA_BASE_URL=https://api.atlassian.com/ex/jira/YOUR_CLOUD_ID` and give
the token permission to read issues. Credentials are read at tool-call time;
other tools can run without them. The server loads `.env` from its working
directory when present, including when launched through the Inspector.
Existing process environment variables take precedence. Restart the server
after editing `.env`. The file is excluded from Git.

```bash
npm run inspect:cli -- --method tools/call \
  --tool-name read_jira_ticket \
  --tool-args-json '{"ticketKey":"NOTE-3456"}'
```

Requests use HTTPS, reject redirects, and time out after 15 seconds.
Authentication, permission, missing-ticket, and rate-limit failures return MCP
tool errors. The shared reader also implements `provision_ticket`'s ticket
lookup; the rest of that provisioning workflow remains unimplemented.

References: [Jira Get issue API](https://developer.atlassian.com/cloud/jira/platform/rest/v2/api-group-issues/#api-rest-api-2-issue-issueidorkey-get)
and [API token authentication](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/).

## Reading a Jira resource

The `jira_ticket` resource template exposes `jira://tickets/{ticketKey}`.
Each read fetches current Jira data and returns an `application/json` document
with the same fields as `read_jira_ticket`, using the same credentials.
The URI is an MCP resource identifier, not an HTTP endpoint to open in a browser.

List the available resource templates:

```bash
npm run inspect:cli -- --method resources/templates/list
```

Read a particular ticket:

```bash
npm run inspect:cli -- --method resources/read \
  --uri jira://tickets/NOTE-3456
```

`resources/list` is empty because tickets are addressed through the template;
the server does not enumerate all Jira issues. Invalid keys and Jira failures
return resource request errors. Reads do not modify Jira or invoke an AI model.

## Analyzing a Jira ticket

Select the MCP prompt `analyze_jira_ticket` in a client that supports prompts
and enter just `ticketKey`, for example `NOTE-3456`. Use the issue key, not
its summary/title. The prompt uses the same Jira credentials as the reader.

The server fetches the ticket and returns its data with instructions for the
AI to explain requirements, identify open questions, inspect available project
code, and propose a minimal implementation and verification plan. The prompt
requests analysis only, without file edits or Jira changes. The client/model
performs the analysis; the MCP server only supplies the messages.

In MCP Inspector, open Prompts, select `analyze_jira_ticket`, fill in
`ticketKey`, and request the prompt. To inspect the generated messages via CLI:

```bash
npm run inspect:cli -- --method prompts/get \
  --prompt-name analyze_jira_ticket \
  --prompt-args ticketKey=NOTE-3456
```

The client must request the prompt explicitly; typing a bare issue key into
an ordinary chat does not automatically invoke an MCP prompt. Jira failures
are returned as prompt request errors instead of generating an empty analysis.

## Testing

Run:

```bash
npm test
```
