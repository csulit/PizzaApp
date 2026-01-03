---
description: Review code for Ignite React Native best practices (delegates to code-reviewer agent)
argument-hint: [path|staged|changed]
---

# Code Review Command

This command delegates to the `code-reviewer` agent for thorough code analysis.

## Usage

```
/code-review                    # Review changed files
/code-review staged             # Review git staged files
/code-review app/screens/       # Review specific directory
/code-review app/screens/Home.tsx  # Review specific file
```

## Instructions

Spawn the `code-reviewer` agent to perform the review:

**Target**: $ARGUMENTS (or "changed files" if empty)

Use the Task tool to spawn the code-reviewer agent with this prompt:

"Review the following for Ignite best practices: $ARGUMENTS

If no specific path given, review files from `git diff --name-only HEAD`.

Read the detailed rules from `.claude/skills/ignite-code-review/reference.md` and provide a structured report with:
- ERRORS (must fix)
- WARNINGS (should fix)
- INFO (suggestions)

Include line numbers and diff examples for fixes."

The agent will:
1. Determine files to review
2. Read each file
3. Check against Ignite patterns
4. Generate a comprehensive report

## Reference

See `.claude/skills/ignite-code-review/reference.md` for the complete list of rules being checked.
