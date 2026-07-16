---
title: "LLM API Integration with Streaming"
order: 1
module: "AI Integration"
track: "typescript"
difficulty: "Advanced"
estimated_time: "60 min"
learning_objectives:
  - "Integrate with the Anthropic API (or any LLM provider)"
  - "Implement streaming and non-streaming response handling"
  - "Build message history management with token limits"
  - "Create system prompts and response parsers"
prerequisites:
  - "claude-code/typescript/lesson-4"
knowledge_refs:
  - "principles/single-responsibility"
  - "patterns/adapter"
  - "technologies/kafka"
validation:
  - type: test-runner
    test_file: "tests/behavior.test.ts"
    framework: vitest
    timeout: 120000
    expected_passes: 5
---

# LLM API Integration with Streaming

This is where we connect our agent to an actual LLM. We'll build a client that handles streaming responses, manages message history, calculates token usage, and handles API errors gracefully.

(Full lesson content continues — see the original 01-lesson-llm-integration.md for complete content)

## Validation Checklist

- [ ] `src/llm/client.ts` sends requests to the LLM API
- [ ] Streaming mode shows tokens in real-time
- [ ] Non-streaming mode returns complete response
- [ ] API errors are caught and reported gracefully
- [ ] Mock mode works without API key (for development)
- [ ] Context manager tracks token usage
- [ ] `npm run build` passes without errors
