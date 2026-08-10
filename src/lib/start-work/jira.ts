import type { JiraTicket } from "./types.js";

// TODO: call the real Jira API.
export async function findTicket(ticketKey: string): Promise<JiraTicket> {
  throw new Error(`not implemented: findTicket(${ticketKey})`);
}

// TODO: call the real Jira API.
export async function transitionToInProgress(ticketKey: string): Promise<void> {
  throw new Error(`not implemented: transitionToInProgress(${ticketKey})`);
}
