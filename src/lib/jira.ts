import { z } from "zod";

export const ticketKeySchema = z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]*-[1-9][0-9]*$/, "Expected a Jira ticket key such as NOTE-3456");

const issueSchema = z.object({
  key: z.string(),
  fields: z.object({
    summary: z.string(),
    description: z.string().nullable(),
    status: z.object({ name: z.string() }),
    assignee: z.object({ displayName: z.string() }).nullable(),
  }),
});

export async function readJiraTicket(ticketKey: string) {
  const key = ticketKeySchema.parse(ticketKey);
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error("Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in the server environment.");
  }

  let base: URL;
  try {
    base = new URL(JIRA_BASE_URL);
  } catch {
    throw new Error("JIRA_BASE_URL must be a valid HTTPS URL.");
  }
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
    throw new Error("JIRA_BASE_URL must use HTTPS without credentials, a query, or a fragment.");
  }
  const url = new URL(`${base.href.replace(/\/$/, "")}/rest/api/2/issue/${encodeURIComponent(key)}`);
  url.searchParams.set("fields", "summary,description,status,assignee");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")}`,
      },
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error("Jira request failed or timed out. Check JIRA_BASE_URL and network access.");
  }

  if (!response.ok) {
    const reasons: Record<number, string> = {
      401: "Authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN.",
      403: "Access denied. Check Jira permissions.",
      404: "Ticket not found or not visible to this account.",
      429: "Rate limit exceeded. Try again later.",
    };
    throw new Error(`Jira HTTP ${response.status}: ${reasons[response.status] ?? "Unable to read ticket."}`);
  }

  let issue;
  try {
    issue = issueSchema.parse(await response.json());
  } catch {
    throw new Error("Jira returned an invalid issue response.");
  }
  return {
    key: issue.key,
    summary: issue.fields.summary,
    description: issue.fields.description ?? "",
    status: issue.fields.status.name,
    assignee: issue.fields.assignee?.displayName ?? null,
  };
}
