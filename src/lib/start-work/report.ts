import type { StartWorkReport } from "./types.js";

export function formatReport(report: StartWorkReport): string {
  const lines = [
    `Jira ${report.ticketKey} moved to In Progress`,
    `Branch "${report.branchName}" created in: ${report.branchesCreated.join(", ")}`,
    `Versions bumped in: ${report.versionsBumped.join(", ")}`,
    report.skillFileCreated ? "SKILL.md created" : "SKILL.md not created",
    `Pull requests: ${report.pullRequests.map((pr) => `${pr.repoName} (${pr.url})`).join(", ")}`,
  ];

  return lines.map((line) => `✓ ${line}`).join("\n");
}
