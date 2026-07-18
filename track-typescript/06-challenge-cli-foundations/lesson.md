---
lesson_type: "challenge"
title: "Build a Code Review Tool"
order: 100
module: "CLI Foundations"
track: "typescript"
difficulty: "Intermediate"
estimated_time: "90 min"
validation:
  - type: file-exists
    path: "src/tools/review-tool.ts"
  - type: file-contains
    path: "src/tools/review-tool.ts"
    contains: "Tool"
    description: "Has a Tool interface implementation"
  - type: npm-test
    script: "build"
---

# Challenge: Build a Code Review Tool

Create a new tool for the agent that performs automated code review. This tool should:

1. Accept a file path as input
2. Read the file content
3. Analyze it for common code quality issues:
   - Functions that are too long (> 50 lines)
   - Deeply nested code (> 3 levels)
   - Missing error handling
   - Hardcoded values
   - TODO/FIXME comments
4. Return a structured report with:
   - File name and size
   - Number of issues found, grouped by severity
   - Specific line numbers and descriptions

## Requirements

- Register the tool with the tool registry
- Handle errors gracefully (file not found, permission denied, etc.)
- Support common source file extensions (.ts, .js, .py, .java, .go, .rs)
- Return results in a format the agent can use as context

## Example Output

```json
{
  "file": "src/main.ts",
  "size": 1234,
  "issues": [
    {
      "line": 45,
      "severity": "warning",
      "rule": "long-function",
      "message": "Function 'processData' is 67 lines (max: 50)"
    },
    {
      "line": 120,
      "severity": "info",
      "rule": "todo-comment",
      "message": "TODO: Handle edge case for empty input"
    }
  ],
  "summary": {
    "error": 0,
    "warning": 2,
    "info": 3,
    "total": 5
  }
}
```

## Hints

- Use `readFileSync` or `readFile` to read the file
- Use regex to detect patterns (TODO, nested blocks, etc.)
- Count lines using `content.split('\n')`
- Use `brace-depth` or indentation counting for nesting detection

Good luck, engineer!
