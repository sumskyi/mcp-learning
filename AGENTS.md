# AGENTS.md

Learning project: an MCP server (Model Context Protocol) written in TypeScript using
`@modelcontextprotocol/sdk` and `zod`.

## Commands

- `npm run dev` — run the server via `tsx src/index.ts` (no build step).
- No tests yet (`npm test` is a placeholder).

## Structure

```
src/
  index.ts       — entry point: sets up StdioServerTransport and connects the server
  server.ts      — McpServer instance; tools/resources/prompts are wired up here
  tools/         — MCP tools (one file per tool, index.ts imports all of them)
  resources/     — MCP resources (currently empty)
  prompts/       — MCP prompts (currently empty)
  lib/           — shared logic/helpers (currently empty)
```

## Adding a new tool

1. Create a file in `src/tools/`, following the pattern in
   [step_one_grep_data.ts](src/tools/step_one_grep_data.ts):
   `server.tool(name, description, zodSchema, handler)`.
2. Add `import "./file-name";` to [src/tools/index.ts](src/tools/index.ts).

Same approach for resources and prompts — a separate file plus an import in the
corresponding `index.ts`.

## Important rules

- **stdout is reserved for the MCP protocol** (JSON-RPC over stdio). Never write to it
  with `console.log`. Use `console.error` only (goes to stderr) for diagnostics/logs —
  already noted in a comment in [src/index.ts](src/index.ts).
- Transport is `StdioServerTransport` — the server talks to the client over the local
  process's stdin/stdout, no network involved.
- `tsconfig.json` uses `module`/`moduleResolution: NodeNext`, so relative imports in
  code (`.ts` files) must use the `.js` extension (as in `server.ts`), even though the
  project runs via `tsx`.
- All documentation and code comments must be written in English only.
- The project is for learning: tools currently return mocked data instead of making
  real external API calls — this is expected, not unfinished work.
