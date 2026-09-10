import { resolveRepos } from "./config.js";
import * as jira from "./jira.js";
import * as git from "./git.js";
import * as version from "./version.js";
import * as bootstrap from "./bootstrap.js";
import * as bitbucket from "./bitbucket.js";
import { formatReport } from "./report.js";
import type { ProvisionTicketReport, VersionSet, VersionsByRepo } from "./types.js";

// Orchestrates the provision_ticket workflow, step by step, across the repos
// this specific ticket touches. Ticket reading uses the Jira API; mutation
// steps remain stubs in jira/git/version/bootstrap/bitbucket.ts.
//
// `repoNames` is supplied by the caller per call — most tickets touch a
// subset of the known repos, never a hardcoded "always all of them" set
// (see SKILL.md "Version step").
//
// `versions` is supplied by the caller (the ticket owner), keyed by repo
// name. A repo missing from `versions` gets no version change —
// provision_ticket never decides bumps on its own.
export async function provisionTicket(
  ticketKey: string,
  repoNames: string[],
  versions: VersionsByRepo = {}
): Promise<string> {
  const repos = resolveRepos(repoNames);
  const branchName = `feature/${ticketKey}`;

  const ticket = await jira.findTicket(ticketKey);
  await jira.transitionToInProgress(ticketKey);

  for (const repo of repos) {
    await git.checkoutMain(repo.path);
    await git.pull(repo.path);
    await git.createBranch(repo.path, branchName);
  }

  const versionsSet: VersionSet[] = [];
  for (const repo of repos) {
    const targetVersion = versions[repo.name];
    if (!targetVersion) continue;

    await version.setVersion(repo.path, targetVersion);
    versionsSet.push({ repoName: repo.name, version: targetVersion });
  }

  await bootstrap.createSkillFile(repos[0].path, ticket);
  await bootstrap.createServiceFiles(repos[0].path);

  for (const repo of repos) {
    await git.commit(repo.path, `Provision ticket ${ticketKey}`);
    await git.push(repo.path, branchName);
  }

  const pullRequests = [];
  for (const repo of repos) {
    pullRequests.push(await bitbucket.createPullRequest(repo.name, repo.path, branchName));
  }

  const report: ProvisionTicketReport = {
    ticketKey,
    branchName,
    branchesCreated: repos.map((repo) => repo.name),
    versionsSet,
    skillFileCreated: true,
    pullRequests,
  };

  return formatReport(report);
}
