// TODO: shell out to real git commands (or a git library) for a repo at `repoPath`.

export async function checkoutMain(repoPath: string): Promise<void> {
  throw new Error(`not implemented: checkoutMain(${repoPath})`);
}

export async function pull(repoPath: string): Promise<void> {
  throw new Error(`not implemented: pull(${repoPath})`);
}

export async function createBranch(repoPath: string, branchName: string): Promise<void> {
  throw new Error(`not implemented: createBranch(${repoPath}, ${branchName})`);
}

export async function commit(repoPath: string, message: string): Promise<void> {
  throw new Error(`not implemented: commit(${repoPath}, ${message})`);
}

export async function push(repoPath: string, branchName: string): Promise<void> {
  throw new Error(`not implemented: push(${repoPath}, ${branchName})`);
}
