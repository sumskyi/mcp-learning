// A repo the start_work workflow touches (branch, version bump, PR).
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

export interface StartWorkReport {
  ticketKey: string;
  branchName: string;
  branchesCreated: string[];
  versionsBumped: string[];
  skillFileCreated: boolean;
  pullRequests: PullRequestResult[];
}
