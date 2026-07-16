---
title: "CLI Foundations Quiz"
order: 99
module: "CLI Foundations"
track: "typescript"
type: "quiz"
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

  - question: "In the agent loop, what happens when the LLM returns a tool_use response?"
    type: "multiple-choice"
    choices:
      - label: "The loop terminates immediately"
        value: "terminate"
      - label: "The tool is executed and the result is fed back to the LLM"
        value: "execute-feedback"
      - label: "The tool is ignored"
        value: "ignore"
      - label: "An error is thrown"
        value: "error"
    answer: "execute-feedback"

  - question: "What is the maximum number of tool iterations in the default agent config?"
    type: "multiple-choice"
    choices:
      - label: "10"
        value: "10"
      - label: "25"
        value: "25"
      - label: "50"
        value: "50"
      - label: "100"
        value: "100"
    answer: "25"

  - question: "Which of the following is NOT a responsibility of the CLI interface?"
    type: "multiple-choice"
    choices:
      - label: "Parsing command-line arguments"
        value: "parse-args"
      - label: "Executing tool calls"
        value: "execute-tools"
      - label: "Providing help output"
        value: "help-output"
      - label: "Setting up logging"
        value: "setup-logging"
    answer: "execute-tools"

  - question: "Why does the agent support both streaming and non-streaming modes?"
    type: "multiple-choice"
    choices:
      - label: "Streaming is for development, non-streaming for production"
        value: "dev-prod"
      - label: "Streaming provides better UX; non-streaming is useful for CI/testing"
        value: "ux-ci"
      - label: "Streaming uses less tokens"
        value: "less-tokens"
      - label: "There is no reason"
        value: "no-reason"
    answer: "ux-ci"

  - question: "What type of schema does each tool define for its input?"
    type: "multiple-choice"
    choices:
      - label: "XML Schema"
        value: "xml"
      - label: "JSON Schema"
        value: "json"
      - label: "GraphQL Schema"
        value: "graphql"
      - label: "Protobuf Schema"
        value: "protobuf"
    answer: "json"

  - question: "True or False: The agent loop continues until the LLM returns a response without tool calls or the max iteration limit is reached."
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
---

# CLI Foundations Quiz

Test your understanding of the core concepts from Module 1.
