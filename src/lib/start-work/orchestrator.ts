import { START_WORK_REPOS } from "./config.js";
import * as jira from "./jira.js";
import * as git from "./git.js";
import * as version from "./version.js";
import * as bootstrap from "./bootstrap.js";
import * as bitbucket from "./bitbucket.js";
import { formatReport } from "./report.js";
import type { StartWorkReport } from "./types.js";

// Orchestrates the start_work workflow, step by step, across all target repos.
// Every step function is currently a stub (see jira/git/version/bootstrap/bitbucket.ts) —
// this only fixes the order the real implementations must run in.
export async function startWork(ticketKey: string): Promise<string> {
  const branchName = `feature/${ticketKey}`;

  const ticket = await jira.findTicket(ticketKey);
  await jira.transitionToInProgress(ticketKey);

  for (const repo of START_WORK_REPOS) {
    await git.checkoutMain(repo.path);
    await git.pull(repo.path);
    await git.createBranch(repo.path, branchName);
  }

  const versionsBumped: string[] = [];
  for (const repo of START_WORK_REPOS) {
    await version.bumpVersion(repo.path);
    versionsBumped.push(repo.name);
  }

  await bootstrap.createSkillFile(START_WORK_REPOS[0].path, ticket);
  await bootstrap.createServiceFiles(START_WORK_REPOS[0].path);

  for (const repo of START_WORK_REPOS) {
    await git.commit(repo.path, `Start work on ${ticketKey}`);
    await git.push(repo.path, branchName);
  }

  const pullRequests = [];
  for (const repo of START_WORK_REPOS) {
    pullRequests.push(await bitbucket.createPullRequest(repo.name, repo.path, branchName));
  }

  const report: StartWorkReport = {
    ticketKey,
    branchName,
    branchesCreated: START_WORK_REPOS.map((repo) => repo.name),
    versionsBumped,
    skillFileCreated: true,
    pullRequests,
  };

  return formatReport(report);
}
