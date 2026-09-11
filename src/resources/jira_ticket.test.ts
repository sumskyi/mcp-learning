import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "../server.js";
import "./index.js";

test("Jira ticket resource over MCP", async (t) => {
  const saved = { ...process.env };
  t.after(() => { process.env = saved; });
  process.env.JIRA_BASE_URL = "https://example.atlassian.net";
  process.env.JIRA_EMAIL = "reader@example.com";
  process.env.JIRA_API_TOKEN = "test-token";

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "resource-test", version: "1.0.0" });
  t.after(async () => { await client.close(); await server.close(); });
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  const { resourceTemplates } = await client.listResourceTemplates();
  const template = resourceTemplates.find(({ name }) => name === "jira_ticket");
  assert.equal(template?.uriTemplate, "jira://tickets/{ticketKey}");
  assert.equal(template?.mimeType, "application/json");
  assert.deepEqual((await client.listResources()).resources, []);

  let summary = "Fix search";
  const fetchMock = t.mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    assert.equal(url.pathname, "/rest/api/2/issue/NOTE-42");
    assert.equal(options.method ?? "GET", "GET");
    return Response.json({ key: "NOTE-42", fields: {
      summary, description: "Keep filters.", status: { name: "Open" }, assignee: null,
    } });
  });

  const uri = "jira://tickets/note-42";
  const result = await client.readResource({ uri });
  assert.equal(result.contents.length, 1);
  const data = result.contents[0];
  assert.equal(data.uri, uri);
  assert.equal(data.mimeType, "application/json");
  assert.ok("text" in data);
  assert.deepEqual(JSON.parse(data.text), {
    key: "NOTE-42", summary, description: "Keep filters.", status: "Open", assignee: null,
  });

  summary = "Updated summary";
  const updated = await client.readResource({ uri });
  const updatedData = updated.contents[0];
  assert.ok("text" in updatedData);
  assert.equal(JSON.parse(updatedData.text).summary, summary);

  await assert.rejects(client.readResource({ uri: "jira://tickets/invalid" }));
  await assert.rejects(client.readResource({ uri: "jira://other/NOTE-42" }));
  assert.equal(fetchMock.mock.callCount(), 2);

  fetchMock.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(client.readResource({ uri }), /Jira HTTP 404/);
});
