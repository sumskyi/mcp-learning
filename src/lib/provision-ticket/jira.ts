export { readJiraTicket as findTicket } from "../jira.js";

// TODO: call the real Jira API.
export async function transitionToInProgress(ticketKey: string): Promise<void> {
  throw new Error(`not implemented: transitionToInProgress(${ticketKey})`);
}
