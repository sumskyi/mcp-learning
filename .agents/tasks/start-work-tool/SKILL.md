---
name: start-work-tool
description: Design and skeleton for a start_work MCP tool that orchestrates Jira, multi-repo Git, versioning, task bootstrap, and Bitbucket PR creation.
metadata:
  status: in-progress
---

## Purpose

`start_work(ticketKey)` is a single MCP tool that automates the repetitive
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

## Design notes

- Multiple repos are involved (currently a placeholder list — real repo
  paths/names are not yet known), so every Git/Bitbucket step is per-repo,
  not a single global step.
- Each step is a plain async function per external system
  (`src/lib/start-work/{jira,git,version,bootstrap,bitbucket}.ts`), wired
  together by `src/lib/start-work/orchestrator.ts`. The MCP tool itself
  (`src/tools/start_work.ts`) only calls the orchestrator and formats the
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
