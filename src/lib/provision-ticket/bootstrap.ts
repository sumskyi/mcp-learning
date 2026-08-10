import type { JiraTicket } from "./types.js";

// TODO: write .agents/tasks/<slug>/SKILL.md for the ticket into `repoPath`.
export async function createSkillFile(repoPath: string, ticket: JiraTicket): Promise<void> {
  throw new Error(`not implemented: createSkillFile(${repoPath}, ${ticket.key})`);
}

// TODO: create any other scaffolding files the task needs (placeholder for now).
export async function createServiceFiles(repoPath: string): Promise<void> {
  throw new Error(`not implemented: createServiceFiles(${repoPath})`);
}
