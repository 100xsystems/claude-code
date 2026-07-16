# Claude Code — 100xSystems

Build an AI-powered coding agent that operates directly in your terminal. This system teaches you how to build the architecture behind tools like Cursor, GitHub Copilot, and Claude Code itself — from the agent loop to tool execution, context management, and streaming LLM communication.

## Tracks

| Track | Language | Difficulty |
|-------|----------|------------|
| [TypeScript](curriculum/track-typescript/) | TypeScript | Advanced |
| [Java](curriculum/track-java/) | Java | Advanced |

## Structure

```
claude-code/
├── README.md
├── .gitignore
├── index.md                 # System metadata and description
├── curriculum/              # All tracks live here
│   ├── track-typescript/
│   │   ├── module-1-cli-foundations/
│   │   │   └── 01-lesson-intro-and-setup/
│   │   │       ├── lesson.md
│   │   │       ├── tests/
│   │   │       │   ├── behavior.test.ts
│   │   │       │   └── fixtures/
│   │   │       └── assets/
│   │   ├── module-2-ai-integration/
│   │   └── module-3-tools-and-plugins/
│   └── track-java/
│       └── module-1-cli-foundations/
├── architecture/            # System architecture docs
└── quizzes/                 # Per-module quizzes
```

## Contributing

Each lesson is a self-contained folder. To contribute:

1. Clone this repository
2. Navigate to the module where you want to add/edit a lesson
3. Each lesson folder contains `lesson.md` (content) and `tests/` (behavioral tests)
4. Submit a PR

## Validation

This system uses the [100xSystems CLI](https://github.com/100xsystems/cli) for validation. Run:

```bash
100xsystems init claude-code
100xsystems validate    # Pick a lesson
100xsystems submit      # When all lessons pass
```
