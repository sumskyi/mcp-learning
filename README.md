# mcp-learning

A learning project for building an MCP (Model Context Protocol) server in
TypeScript, using `@modelcontextprotocol/sdk` and `zod`.

See [AGENTS.md](AGENTS.md) for project structure and conventions.

## Requirements

- Node.js
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
  --tool-name step_one_grep_data \
  --tool-arg rawText="user_id=42 error log"
```

Note the `--` after `inspect:cli` — it tells npm to forward everything after
it to the underlying command instead of parsing it as npm's own flags.

Arguments can also be passed as a single JSON object instead of `key=value`
pairs:

```bash
npm run inspect:cli -- --method tools/call \
  --tool-name step_one_grep_data \
  --tool-args-json '{"rawText":"user_id=42 error log"}'
```

To just list the available tools without calling one:

```bash
npm run inspect:cli -- --method tools/list
```

## Available tools

- `step_one_grep_data` — takes raw text and extracts a mock ID from it, meant
  as the first link of a Unix-style tool pipeline
  ([src/tools/step_one_grep_data.ts](src/tools/step_one_grep_data.ts)).
