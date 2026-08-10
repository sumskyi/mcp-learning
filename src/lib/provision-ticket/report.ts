import type { ProvisionTicketReport } from "./types.js";

export function formatReport(report: ProvisionTicketReport): string {
  const lines = [
    `Jira ${report.ticketKey} moved to In Progress`,
    `Branch "${report.branchName}" created in: ${report.branchesCreated.join(", ")}`,
    `Versions set: ${report.versionsSet.map((v) => `${v.repoName}@${v.version}`).join(", ") || "none"}`,
    report.skillFileCreated ? "SKILL.md created" : "SKILL.md not created",
    `Pull requests: ${report.pullRequests.map((pr) => `${pr.repoName} (${pr.url})`).join(", ")}`,
  ];

  return lines.map((line) => `✓ ${line}`).join("\n");
}
