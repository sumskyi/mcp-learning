import type { PullRequestResult } from "./types.js";

// TODO: call the real Bitbucket API.
export async function createPullRequest(
  repoName: string,
  repoPath: string,
  branchName: string
): Promise<PullRequestResult> {
  throw new Error(`not implemented: createPullRequest(${repoName}, ${repoPath}, ${branchName})`);
}
