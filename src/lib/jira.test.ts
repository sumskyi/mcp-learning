import assert from "node:assert/strict";
import { test } from "node:test";
import { readJiraTicket } from "./jira.js";

test("Jira reader", async (t) => {
  const saved = { ...process.env };
  t.after(() => { process.env = saved; });
  process.env.JIRA_BASE_URL = "https://example.atlassian.net/";
  process.env.JIRA_EMAIL = "reader@example.com";
  process.env.JIRA_API_TOKEN = "test-token";

  await t.test("reads and normalizes a ticket with a GET request", async (t) => {
    t.mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
      assert.equal(url.href, "https://example.atlassian.net/rest/api/2/issue/NOTE-42?fields=summary%2Cdescription%2Cstatus%2Cassignee");
      assert.equal(options.method ?? "GET", "GET");
      assert.equal(options.redirect, "error");
      assert.ok(options.signal);
      assert.equal(new Headers(options.headers).get("Authorization"), `Basic ${Buffer.from("reader@example.com:test-token").toString("base64")}`);
      return Response.json({ key: "NOTE-42", fields: {
        summary: "A ticket", description: null, status: { name: "Open" }, assignee: null,
      } });
    });
    assert.deepEqual(await readJiraTicket(" note-42 "), {
      key: "NOTE-42", summary: "A ticket", description: "", status: "Open", assignee: null,
    });
  });

  for (const status of [401, 403, 404, 429, 500]) {
    await t.test(`reports HTTP ${status} without exposing response bodies`, async (t) => {
      t.mock.method(globalThis, "fetch", async () => new Response("secret response", { status }));
      await assert.rejects(readJiraTicket("NOTE-42"), (error: Error) => {
        assert.match(error.message, new RegExp(`HTTP ${status}`));
        assert.doesNotMatch(error.message, /secret response/);
        return true;
      });
    });
  }

  await t.test("rejects invalid responses and network failures", async (t) => {
    const mock = t.mock.method(globalThis, "fetch", async () => Response.json({}));
    await assert.rejects(readJiraTicket("NOTE-42"), /invalid issue response/);
    mock.mock.mockImplementation(async () => { throw new Error("secret network detail"); });
    await assert.rejects(readJiraTicket("NOTE-42"), /failed or timed out/);
  });

  await t.test("rejects invalid input and configuration before fetching", async (t) => {
    const mock = t.mock.method(globalThis, "fetch", async () => Response.json({}));
    await assert.rejects(readJiraTicket("../other"));
    process.env.JIRA_BASE_URL = "http://example.atlassian.net";
    await assert.rejects(readJiraTicket("NOTE-42"), /HTTPS/);
    delete process.env.JIRA_API_TOKEN;
    await assert.rejects(readJiraTicket("NOTE-42"), /Set JIRA_BASE_URL/);
    assert.equal(mock.mock.callCount(), 0);
  });
});
