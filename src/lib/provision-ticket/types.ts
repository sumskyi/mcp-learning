// A repo the provision_ticket workflow touches (branch, version bump, PR).
export interface RepoTarget {
  name: string;
  path: string;
}

export interface JiraTicket {
  key: string;
  summary: string;
  description: string;
}

export interface PullRequestResult {
  repoName: string;
  url: string;
}

// Repo name -> exact version string to set. Decided by the ticket owner, not
// computed by provision_ticket (see SKILL.md "Version step"). A repo absent
// from this map gets no version change at all.
export type VersionsByRepo = Record<string, string>;

export interface VersionSet {
  repoName: string;
  version: string;
}

export interface ProvisionTicketReport {
  ticketKey: string;
  branchName: string;
  branchesCreated: string[];
  versionsSet: VersionSet[];
  skillFileCreated: boolean;
  pullRequests: PullRequestResult[];
}
