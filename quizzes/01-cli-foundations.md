---
title: "CLI Foundations Quiz"
order: 1
questions:
  - question: "What three phases make up the agent loop?"
    type: "multiple-choice"
    choices:
      - label: "Build → Test → Deploy"
        value: "build-test-deploy"
      - label: "Think → Act → Observe"
        value: "think-act-observe"
      - label: "Plan → Code → Review"
        value: "plan-code-review"
      - label: "Input → Process → Output"
        value: "input-process-output"
    answer: "think-act-observe"

  - question: "Which design pattern does the tool registry use?"
    type: "multiple-choice"
    choices:
      - label: "Singleton Pattern"
        value: "singleton"
      - label: "Factory Pattern"
        value: "factory"
      - label: "Strategy Pattern"
        value: "strategy"
      - label: "Observer Pattern"
        value: "observer"
    answer: "strategy"

  - question: "What is the purpose of the safePath() function in the file tools?"
    type: "multiple-choice"
    choices:
      - label: "To encrypt file contents"
        value: "encrypt"
      - label: "To prevent path traversal attacks"
        value: "path-traversal"
      - label: "To speed up file reads"
        value: "speed"
      - label: "To validate file extensions"
        value: "validate-ext"
    answer: "path-traversal"

  - question: "True or False: The agent loop continues until the LLM returns a response without tool calls."
    type: "true-false"
    answer: true

  - question: "Which tool would the agent use to find all files containing the string 'TODO'?"
    type: "multiple-choice"
    choices:
      - label: "read_file"
        value: "read-file"
      - label: "execute_command"
        value: "execute-command"
      - label: "search_code"
        value: "search-code"
      - label: "list_files"
        value: "list-files"
    answer: "search-code"

  - question: "What happens when the LLM returns a response with tool calls?"
    type: "multiple-choice"
    choices:
      - label: "The loop terminates"
        value: "terminate"
      - label: "The tools are executed and results fed back"
        value: "execute-feedback"
      - label: "The tool calls are ignored"
        value: "ignore"
      - label: "An error is thrown"
        value: "error"
    answer: "execute-feedback"
---

# CLI Foundations Quiz

Test your understanding of the core concepts from Module 1.
