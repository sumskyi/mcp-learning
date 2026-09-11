import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "../server.js";
import "./index.js";

test("Jira analysis prompt over MCP", async (t) => {
  const saved = { ...process.env };
  t.after(() => { process.env = saved; });
  process.env.JIRA_BASE_URL = "https://example.atlassian.net";
  process.env.JIRA_EMAIL = "reader@example.com";
  process.env.JIRA_API_TOKEN = "test-token";

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "prompt-test", version: "1.0.0" });
  t.after(async () => { await client.close(); await server.close(); });
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  const { prompts } = await client.listPrompts();
  const prompt = prompts.find(({ name }) => name === "analyze_jira_ticket");
  assert.deepEqual(prompt?.arguments?.map(({ name, required }) => ({ name, required })),
    [{ name: "ticketKey", required: true }]);

  const fetchMock = t.mock.method(globalThis, "fetch", async (url: URL) => {
    assert.equal(url.pathname, "/rest/api/2/issue/NOTE-42");
    return Response.json({ key: "NOTE-42", fields: {
      summary: "Fix search", description: "Keep filters when navigating back.",
      status: { name: "Open" }, assignee: { displayName: "Reader" },
    } });
  });

  const result = await client.getPrompt({ name: "analyze_jira_ticket", arguments: { ticketKey: " note-42 " } });
  assert.equal(result.messages.length, 2);
  assert.equal(result.messages[0].role, "user");
  const data = result.messages[1].content;
  assert.equal(data.type, "text");
  if (data.type !== "text") throw new Error("Expected text ticket data");
  assert.deepEqual(JSON.parse(data.text), {
    key: "NOTE-42", summary: "Fix search", description: "Keep filters when navigating back.",
    status: "Open", assignee: "Reader",
  });

  await assert.rejects(client.getPrompt({ name: "analyze_jira_ticket", arguments: {} }));
  await assert.rejects(client.getPrompt({ name: "analyze_jira_ticket", arguments: { ticketKey: "../bad" } }));
  assert.equal(fetchMock.mock.callCount(), 1);

  fetchMock.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(client.getPrompt({ name: "analyze_jira_ticket", arguments: { ticketKey: "NOTE-42" } }), /Jira HTTP 404/);
});
