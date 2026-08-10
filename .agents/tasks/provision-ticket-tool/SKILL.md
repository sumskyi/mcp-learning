---
name: provision-ticket-tool
description: Design and skeleton for a provision_ticket MCP tool that orchestrates Jira, multi-repo Git, versioning, task bootstrap, and Bitbucket PR creation.
metadata:
  status: in-progress
---

## Purpose

`provision_ticket(ticketKey, repos, versions?)` is a single MCP tool that automates the repetitive
setup done at the start of every ticket, across several external systems, so
the caller gets one command instead of a manual checklist.

## Workflow

1. **Jira**
   - find the ticket by key
   - read its description
   - transition it to `In Progress`
2. **Git** (per target repo)
   - checkout `main`
   - pull
   - create a branch named after the ticket
3. **Version**
   - bump the version in each repo
4. **Project bootstrap**
   - create `SKILL.md` for the new task
   - create any other scaffolding files the task needs
5. **Git** (per target repo)
   - commit (if bootstrap/version steps produced changes)
   - push
6. **Bitbucket**
   - open a pull request per repo
7. **Report**
   - return a short checklist of what was done

## Version step — per-repo subtasks

Confirmed by reading each repo's README and, for the notetaking set,
`CROSS_REPO_VERSIONING_POLICY.md` (in `notetaking-ng`). All three repos are
currently at `0.13.0` (MAJOR.MINOR aligned, as the policy requires) and each
has its own file layout — there is no shared "version bump" mechanism, so
this is one subtask per repo, not one generic implementation.

### Subtask: `notetaking-webserver-simulator` (Ruby/Grape)

- `app/api/version.rb` — `Version = "X.Y.Z"` constant.
- `app/api/api.rb:170` — `doc_version: "X.Y.Z"` inside `add_swagger_documentation`,
  a **second, independent copy** of the same string (grep-verified, not
  derived from `Version`). Both must be bumped together or they drift.
- `CHANGELOG.md` — new `## Version X.Y.Z [DD.MM.YYYY]` entry.

### Subtask: `notetaking_e2e` (Playwright, Node)

- `package.json` — `version` field.
- `package-lock.json` — regenerate via `npm install` after bumping
  `package.json`, not a manual edit (per its own README).
- `CHANGELOG.md` — new `## Version X.Y.Z [DD.MM.YYYY]` entry.

### Subtask: `notetaking-ng` (Angular)

- `package.json` — `version` field.
- `VERSIONS.ts` — two fields, not one: `appVersion` becomes the new version,
  `prevAppVersion` becomes whatever `appVersion` was before the bump. Order
  of operations matters (read old `appVersion` before overwriting it).
- `package-lock.json` — regenerate via `npm install`, same as `notetaking_e2e`.
- `CHANGELOG.md` — new `## Version X.Y.Z [DD.MM.YYYY]` entry.

### Shared changelog entry shape

Observed in all three `CHANGELOG.md` files:

```
## Version X.Y.Z [DD.MM.YYYY]

Task: NOTE-<id> <ticket summary>
```

`NOTE-<id> <ticket summary>` can be filled directly from the Jira step's
result (`ticket.key` + `ticket.summary`), so Version doesn't need its own
copy of that data — it can take the already-fetched `JiraTicket`.

### Decision: version is an input, not something provision_ticket computes

`CROSS_REPO_VERSIONING_POLICY.md` §1 and §7 forbid bumping a repo with no
real changes and forbid no-op alignment commits — so `provision_ticket` must never
decide *whether* or *by how much* to bump a version on its own; only the
ticket owner knows that at ticket-start time.

Resolution: `provision_ticket` takes an explicit `versions: Record<repoName,
version>` parameter. A repo missing from that map gets **no** version
change. `version.ts::setVersion(repoPath, version)` just writes the given
string into that repo's files — it never reads the current version or does
semver math. (Renamed from `bumpVersion` to `setVersion` since it no longer
computes a bump — see AGENTS.md's imported Law of Names: a function's name
must match what it actually does.)

### Decision: target repos are an explicit per-call parameter, not a constant

Walked through a real example: parent ticket NOTE-349 (`notetaking-ng`) and
child ticket NOTE-371 (`notetaking-webserver-simulator`, "one of the steps
toward 349") land in the same `feature/NOTE-349` branch — 371 never gets its
own branch and never calls `provision_ticket` on its own. So the unit of work
`provision_ticket` operates on is "one branch for one ticket, in whichever repos
that specific ticket touches" — never a fixed "always these N repos" set,
and never one call per Jira sub-ticket either.

Resolution: `provision_ticket(ticketKey, repos, versions?)` — `repos` is a
required list of repo names, resolved against the static registry in
`src/lib/provision-ticket/config.ts` (`resolveRepos`, throws on an unknown name).
The registry itself doesn't change per ticket; only which subset of it a
given call uses does. Git/bootstrap/Bitbucket steps now loop over that
resolved subset, not the full registry.

## Design notes

- Multiple repos are involved: `notetaking-webserver-simulator`,
  `notetaking_e2e`, `notetaking-ng` (in that order — see
  `CROSS_REPO_VERSIONING_POLICY.md` §3, dependency-first merge order),
  configured in `src/lib/provision-ticket/config.ts`. Every Git/Bitbucket step is
  per-repo, not a single global step.
- Each step is a plain async function per external system
  (`src/lib/provision-ticket/{jira,git,version,bootstrap,bitbucket}.ts`), wired
  together by `src/lib/provision-ticket/orchestrator.ts`. The MCP tool itself
  (`src/tools/provision_ticket.ts`) only calls the orchestrator and formats the
  result.
- Per [AGENTS.md](../../../AGENTS.md), this is a learning project: tools may
  return mocked data. Current stage is **structure only** — every step
  function is a stub that throws `not implemented`. Real Jira/Git/Bitbucket
  calls are a follow-up, once the shape of the workflow is agreed.
- Partial-failure handling (idempotent steps, safe retries when e.g. a
  branch was already created but a PR failed) is a known open concern, not
  addressed yet at the structure stage.

## Status

Structure only, no real API/Git calls implemented yet. Next step: implement
one system at a time (start with Git, since it needs no external
credentials), keeping the orchestrator's step order unchanged.
