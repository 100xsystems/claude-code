---
title: "Communicate with the LLM"
description: "Connect to an LLM via a REST API and send structured requests"
order: 7
difficulty: "Intermediate"
---

# Communicate with the LLM

The first thing Claude Code needs is the ability to talk to an AI model. This chapter covers connecting to an LLM via a REST API.

## The AI Service

Create a service that sends prompts to the LLM and receives responses:

```java
package com.claudecode.ai;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final RestClient restClient;

    public AiService() {
        this.restClient = RestClient.builder()
            .baseUrl("https://api.anthropic.com/v1")
            .defaultHeader("x-api-key", System.getenv("ANTHROPIC_API_KEY"))
            .defaultHeader("anthropic-version", "2023-06-01")
            .defaultHeader("Content-Type", "application/json")
            .build();
    }

    public String sendMessage(String prompt) {
        var body = Map.of(
            "model", "claude-sonnet-4-20250514",
            "max_tokens", 4096,
            "messages", List.of(Map.of(
                "role", "user",
                "content", prompt
            ))
        );

        var response = restClient.post()
            .uri("/messages")
            .body(body)
            .retrieve()
            .toEntity(Map.class);

        return extractContent(response.getBody());
    }

    private String extractContent(Map<String, Object> response) {
        var content = (List<Map<String, Object>>) response.get("content");
        if (content != null && !content.isEmpty()) {
            return (String) content.get(0).get("text");
        }
        return "";
    }
}
```

## Understanding the API Structure

LLM APIs typically follow a standard pattern:

1. **Authentication** — API key in the header
2. **Request Body** — Model name, messages array, max tokens, temperature
3. **Response** — Content blocks with the model's text response

## Handling Streaming Responses

For a responsive experience, stream the response token by token:

```java
public Flux<String> streamResponse(String prompt) {
    var body = Map.of(
        "model", "claude-sonnet-4-20250514",
        "max_tokens", 4096,
        "stream", true,
        "messages", List.of(Map.of("role", "user", "content", prompt))
    );

    return restClient.post()
        .uri("/messages")
        .body(body)
        .retrieve()
        .bodyToFlux(String.class)
        .filter(line -> line.startsWith("data: "))
        .map(line -> line.substring(6))
        .filter(data -> !"[DONE]".equals(data))
        .map(this::parseDelta);
}

private String parseDelta(String data) {
    // Parse SSE delta from streaming response
    return data;
}
```

## Error Handling

```java
public String sendMessageWithRetry(String prompt, int maxRetries) {
    for (int attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return sendMessage(prompt);
        } catch (Exception e) {
            if (attempt == maxRetries) throw e;
            try {
                Thread.sleep((long) Math.pow(2, attempt) * 1000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(ie);
            }
        }
    }
    return "";
}
```
```
