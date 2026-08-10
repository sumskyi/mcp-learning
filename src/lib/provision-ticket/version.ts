// Writes an explicit version into the repo's manifest(s). The version value
// itself is supplied by the caller (the ticket owner decides it) — this
// function never computes a bump. See SKILL.md "Version step" for why:
// CROSS_REPO_VERSIONING_POLICY.md forbids no-op/auto-aligned bumps, and only
// the owner knows whether this repo needs MAJOR/MINOR/PATCH, or no change.
export async function setVersion(repoPath: string, version: string): Promise<void> {
  throw new Error(`not implemented: setVersion(${repoPath}, ${version})`);
}
