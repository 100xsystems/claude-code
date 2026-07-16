---
title: "Implement the Agent Loop"
description: "Build the core loop that lets the AI think, act, and observe results"
order: 9
difficulty: "Advanced"
---

# Implement the Agent Loop

The agent loop is the heart of Claude Code. It's a cycle that repeats until a task is complete: **think → act → observe**.

## The Loop Architecture

```
User → Send context + tools → LLM responds with action → Execute tool → Send result back → repeat
```

## Basic Agent Loop Implementation

```java
package com.claudecode.agent;

import com.claudecode.ai.AiService;
import com.claudecode.tools.ToolRegistry;
import com.claudecode.tools.ToolResult;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AgentLoop {

    private final AiService aiService;
    private final ToolRegistry toolRegistry;
    private final List<Map<String, Object>> messages;

    public AgentLoop(AiService aiService, ToolRegistry toolRegistry) {
        this.aiService = aiService;
        this.toolRegistry = toolRegistry;
        this.messages = new ArrayList<>();
    }

    public String execute(String userPrompt) {
        messages.add(Map.of("role", "user", "content", userPrompt));
        int maxIterations = 25;

        for (int i = 0; i < maxIterations; i++) {
            var response = aiService.sendWithTools(messages, toolRegistry.getDefinitions());
            var stopReason = (String) response.get("stop_reason");

            if ("end_turn".equals(stopReason)) {
                var content = extractTextContent(response);
                messages.add(Map.of("role", "assistant", "content", content));
                return content;
            }

            var toolCalls = extractToolCalls(response);
            messages.add(Map.of("role", "assistant", "content", toolCalls));

            for (var toolCall : toolCalls) {
                var name = (String) toolCall.get("name");
                var args = (Map<String, Object>) toolCall.get("args");
                var result = toolRegistry.execute(name, args);
                messages.add(Map.of("role", "user", "content", formatToolResult(name, result)));
            }
        }
        return "Reached maximum iteration limit of " + maxIterations;
    }

    private String extractTextContent(Map<String, Object> response) { return ""; }
    private List<Map<String, Object>> extractToolCalls(Map<String, Object> response) { return List.of(); }
    private String formatToolResult(String name, ToolResult result) { return ""; }
}
```

## Managing Context Windows

LLMs have limited context windows. Keep conversation history from growing too large:

```java
private void trimHistoryIfNeeded() {
    int estimatedTokens = estimateTokenCount(messages);
    int maxTokens = 100_000;

    if (estimatedTokens > maxTokens * 0.7) {
        var systemMessage = messages.get(0);
        var recentMessages = messages.subList(Math.max(1, messages.size() - 10), messages.size());
        messages.clear();
        messages.add(systemMessage);
        messages.add(Map.of("role", "user", "content", "[Previous context summarized...]"));
        messages.addAll(recentMessages);
    }
}
```
```
