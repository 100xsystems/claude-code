---
title: "Implement File & System Tools"
order: 4
module: "CLI Foundations"
track: "typescript"
difficulty: "Intermediate"
estimated_time: "60 min"
learning_objectives:
  - "Implement file read/write tools for the agent"
  - "Build command execution tools with sandboxing"
  - "Create a glob/search tool for codebase exploration"
prerequisites:
  - "claude-code/typescript/lesson-3"
knowledge_refs:
  - "patterns/adapter"
  - "principles/single-responsibility"
validation:
  - type: test-runner
    test_file: "tests/behavior.test.ts"
    framework: vitest
    timeout: 120000
    expected_passes: 6
---

# Implement File & System Tools

The tool system is how our agent interacts with the user's environment. Each tool is a capability the agent can use — reading files, writing code, executing commands, searching the codebase.

## Tool Design Principles

Each tool follows a strict contract:

```
┌──────────────────────────────────────┐
│              Tool Contract             │
├──────────────────────────────────────┤
│  name: string                         │
│  description: string                  │
│  inputSchema: JSON Schema             │
│  execute(input): Promise<unknown>     │
└──────────────────────────────────────┘
```

(Full lesson content continues — see the original .md file for complete content)

## Validation Checklist

- [ ] Read file tool works with relative paths
- [ ] Write file tool creates directories automatically
- [ ] List files tool distinguishes files from directories
- [ ] Execute command tool returns stdout/stderr/exitCode
- [ ] Search tool finds patterns in the codebase
- [ ] Path traversal is blocked
- [ ] All tools are registered in the registry
