---
title: "Build the Java CLI with Picocli"
order: 2
module: "CLI Foundations"
track: "java"
difficulty: "Beginner"
estimated_time: "45 min"
learning_objectives:
  - "Implement a full CLI with subcommands using Picocli"
  - "Handle interactive and non-interactive modes"
  - "Process stdin/stdout for tool communication"
prerequisites:
  - "claude-code/java/module-1/lesson-1"
knowledge_refs:
  - "patterns/adapter"
  - "principles/single-responsibility"
validation:
  - type: file-exists
    path: "src/main/java/com/claudecode/cli/CLIApplication.java"
    must_contain: "CommandLine"
  - type: file-contains
    path: "src/main/java/com/claudecode/cli/CLIApplication.java"
    pattern: "implements.*Callable"
    description: "Has Callable implementation for commands"
  - type: file-exists
    path: "src/main/java/com/claudecode/agent/Agent.java"
  - type: cli-command
    command: "mvn compile -q"
    description: "Maven project compiles"
---

# Build the Java CLI with Picocli

In this lesson, we'll build the full CLI interface using Picocli — a powerful framework for creating Java command-line applications with minimal boilerplate.

## CLI Architecture

```
User Input (terminal)
       │
       ▼
┌──────────────────────┐
│    Picocli Parser     │  ← @Command, @Parameters, @Option annotations
│  (CLIApplication.java)│
└─────────┬───────────┘
          │
          ▼
┌──────────────────────┐
│    Agent              │  ← Orchestrates AI interaction
│  (Agent.java)         │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────┐
│    ToolRegistry       │  ← Executes actions via registered tools
│  (tools/ToolRegistry) │
└──────────────────────┘
```

## Step 1: Enhance the CLI with Full Command Support

Update `CLIApplication.java` to handle interactive sessions properly:

```java
package com.claudecode.cli;

import com.claudecode.agent.Agent;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.Callable;

@Command(
    name = "claude-code",
    description = "AI-powered coding agent",
    version = "0.1.0",
    mixinStandardHelpOptions = true,
    subcommands = {
        ChatCommand.class,
        ExecuteCommand.class,
        PipeCommand.class
    }
)
public class CLIApplication implements Callable<Integer> {

    @Option(names = {"-m", "--model"}, description = "LLM model")
    String model = System.getenv().getOrDefault("LLM_MODEL", "claude-sonnet-4-20250514");

    @Option(names = {"--max-tokens"}, description = "Max response tokens")
    int maxTokens = 4096;

    @Override
    public Integer call() {
        CommandLine.usage(this, System.out);
        return 0;
    }

    public int run(String[] args) {
        return new CommandLine(this).execute(args);
    }

    @Command(name = "chat", description = "Start interactive AI coding session", mixinStandardHelpOptions = true)
    static class ChatCommand implements Callable<Integer> {
        @Parameters(index = "0", defaultValue = "", description = "Initial message")
        String message;

        @Option(names = {"--no-stream"}, description = "Disable streaming")
        boolean noStream;

        @Override
        public Integer call() throws Exception {
            Agent agent = new Agent();
            if (!message.isEmpty()) {
                System.out.println("> " + message);
                String result = agent.executeTask(message);
                System.out.println(result);
                return 0;
            }
            // Interactive REPL mode
            System.out.println("🤖 Claude Code ready (Ctrl+C to exit)");
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.equalsIgnoreCase("exit") || line.equalsIgnoreCase("quit")) break;
                    String result = agent.executeTask(line);
                    System.out.println(result);
                    System.out.print("\n> ");
                }
            }
            return 0;
        }
    }

    @Command(name = "execute", description = "Execute single task", mixinStandardHelpOptions = true)
    static class ExecuteCommand implements Callable<Integer> {
        @Parameters(index = "0", description = "Task description")
        String task;

        @Override
        public Integer call() throws Exception {
            Agent agent = new Agent();
            String result = agent.executeTask(task);
            System.out.println(result);
            return 0;
        }
    }
}
```

## Step 2: Create the Agent Class

Create `src/main/java/com/claudecode/agent/Agent.java`:

```java
package com.claudecode.agent;

import com.claudecode.llm.LLMClient;

import java.util.ArrayList;
import java.util.List;

public class Agent {
    private final LLMClient llmClient;
    private final List<String> messageHistory;

    public Agent() {
        this.llmClient = new LLMClient();
        this.messageHistory = new ArrayList<>();
    }

    public String executeTask(String task) {
        messageHistory.add("User: " + task);

        // Call LLM
        String response = llmClient.send(task);

        // Process response and execute tools if needed
        String result = processResponse(response);

        messageHistory.add("Assistant: " + result);
        return result;
    }

    private String processResponse(String response) {
        // Parse tool calls from response
        // Execute tools
        // Return final result
        return response;
    }

    public List<String> getHistory() {
        return new ArrayList<>(messageHistory);
    }

    public void clearHistory() {
        messageHistory.clear();
    }
}
```

## Step 3: Create the LLM Client

Create `src/main/java/com/claudecode/llm/LLMClient.java`:

```java
package com.claudecode.llm;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class LLMClient {
    private final HttpClient httpClient;
    private final ObjectMapper mapper;
    private final String apiKey;
    private final String apiUrl;

    public LLMClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.mapper = new ObjectMapper();
        this.apiKey = System.getenv().getOrDefault("ANTHROPIC_API_KEY", "");
        this.apiUrl = System.getenv().getOrDefault("LLM_API_URL",
            "https://api.anthropic.com/v1/messages");
    }

    public String send(String message) {
        if (apiKey.isEmpty()) {
            return mockResponse(message);
        }

        try {
            Map<String, Object> body = Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 4096,
                "messages", new Object[]{
                    Map.of("role", "user", "content", message)
                }
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                .build();

            HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "Error: API returned " + response.statusCode();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> json = mapper.readValue(response.body(), Map.class);
            @SuppressWarnings("unchecked")
            var content = (java.util.List<Map<String, Object>>) json.get("content");
            if (content != null && !content.isEmpty()) {
                return (String) content.get(0).get("text");
            }
            return "No response content";

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String mockResponse(String message) {
        if (message.toLowerCase().contains("hello") || message.toLowerCase().contains("hi")) {
            return "Hello! I'm Claude Code, your AI coding assistant. How can I help you today?";
        }
        return "I understand you want me to: " + message + "\n\n" +
               "Let me examine the project structure and get started.";
    }
}
```

## Step 4: Test the CLI

```bash
mvn compile -q                           # Build
mvn exec:java -Dexec.mainClass="com.claudecode.Main" -- --help  # Help
mvn exec:java -Dexec.mainClass="com.claudecode.Main" -- chat    # Interactive
mvn exec:java -Dexec.mainClass="com.claudecode.Main" -- execute "Hello"  # Task
```

## Engineering Decision: Picocli vs Spring Shell

**Context:** Need a CLI framework for the Java implementation.

**Decision:** Use Picocli instead of Spring Shell.

**Why:** Picocli is annotation-driven, lightweight (no Spring context needed), and generates native help/autocomplete automatically. Spring Shell adds unnecessary overhead for a CLI that primarily runs non-interactively.

| Aspect | Picocli | Spring Shell |
|--------|---------|-------------|
| Startup time | ~100ms | ~2-3s |
| Dependencies | 1 JAR | Full Spring Boot |
| Annotation model | @Command, @Parameters | @ShellMethod, @ShellOption |
| Native image | Excellent | Complex |
| Autocomplete | Built-in | Manual |

## Validation Checklist

- [ ] Picocli CLI has chat and execute commands
- [ ] Interactive mode handles user input in a loop
- [ ] Agent class orchestrates LLM communication
- [ ] LLM client handles both real API and mock mode
- [ ] Error handling covers API failures gracefully
- [ ] `mvn compile` passes without errors
