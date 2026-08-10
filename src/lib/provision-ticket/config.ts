import type { RepoTarget } from "./types.js";

// Registry of repos provision_ticket knows how to target. Which of these a given
// call actually touches is decided per call (see orchestrator.ts) — most
// tickets touch a subset, not all of them (see SKILL.md "Version step").
export const START_WORK_REPOS: RepoTarget[] = [
  { name: "notetaking-webserver-simulator", path: "/home/vlad/Code/_MacLabs/notetaking-webserver-simulator" },
  { name: "notetaking_e2e", path: "/home/vlad/Code/_MacLabs/notetaking_e2e" },
  { name: "notetaking-ng", path: "/home/vlad/Code/_MacLabs/notetaking-ng" },
];

// Looks up repos by name, preserving the registry's dependency-first order
// regardless of the order names were requested in.
export function resolveRepos(names: string[]): RepoTarget[] {
  const unknown = names.filter((name) => !START_WORK_REPOS.some((repo) => repo.name === name));
  if (unknown.length > 0) {
    throw new Error(`unknown repo(s): ${unknown.join(", ")}`);
  }

  return START_WORK_REPOS.filter((repo) => names.includes(repo.name));
}
