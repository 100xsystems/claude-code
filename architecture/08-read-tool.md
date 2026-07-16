---
title: "Advertise and Execute the Read Tool"
description: "Define tool schemas that let the LLM read files from the project"
order: 8
difficulty: "Advanced"
---

# Advertise and Execute the Read Tool

Tools are how Claude Code interacts with the world. Each tool has a schema that tells the LLM what it can do and a handler that actually does it.

## What Are Tools?

When you chat with Claude Code and ask it to read a file, it doesn't just guess — it uses a **tool**. The flow works like this:

1. You say: "Show me main.java"
2. Claude sees it has a `read` tool available
3. Claude decides to call `read("main.java")`
4. Your code executes the file read and returns the content
5. Claude sees the result and responds with what it found

## Defining Tool Schemas

Each tool needs a JSON schema that describes its purpose and parameters:

```java
package com.claudecode.tools;

import java.util.Map;

public record ToolDefinition(
    String name,
    String description,
    Map<String, Object> inputSchema
) {

    public static ToolDefinition readTool() {
        return new ToolDefinition(
            "read",
            "Read the contents of a file in the project. " +
            "Returns the file content as text.",
            Map.of(
                "type", "object",
                "properties", Map.of(
                    "filePath", Map.of(
                        "type", "string",
                        "description", "The path to the file to read, relative to the project root"
                    )
                ),
                "required", java.util.List.of("filePath")
            )
        );
    }
}
```

## The Tool Registry

Keep all available tools in a registry that the agent loop can query:

```java
package com.claudecode.tools;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ToolRegistry {

    private final Map<String, ToolHandler> tools;

    public ToolRegistry() {
        this.tools = Map.of(
            "read", new ReadToolHandler()
        );
    }

    public List<ToolDefinition> getDefinitions() {
        return tools.values().stream()
            .map(ToolHandler::getDefinition)
            .collect(Collectors.toList());
    }

    public ToolResult execute(String name, Map<String, Object> args) {
        var handler = tools.get(name);
        if (handler == null) {
            return new ToolResult(false, "Unknown tool: " + name);
        }
        return handler.execute(args);
    }
}
```

## Implementing the Read Handler

```java
package com.claudecode.tools;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

public class ReadToolHandler implements ToolHandler {

    private final Path projectRoot;

    public ReadToolHandler() {
        this.projectRoot = Paths.get(System.getProperty("user.dir"));
    }

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.readTool();
    }

    @Override
    public ToolResult execute(Map<String, Object> args) {
        try {
            var filePath = (String) args.get("filePath");
            var resolved = projectRoot.resolve(filePath).normalize();

            if (!resolved.startsWith(projectRoot)) {
                return new ToolResult(false, "Access denied: file is outside the project directory");
            }

            if (!Files.exists(resolved)) {
                return new ToolResult(false, "File not found: " + filePath);
            }

            var content = Files.readString(resolved);
            return new ToolResult(true, content);

        } catch (IOException e) {
            return new ToolResult(false, "Error reading file: " + e.getMessage());
        }
    }
}
```

## Security Considerations

Always validate paths to prevent **path traversal attacks**:

```java
// ❌ Dangerous — allows reading any file on the system
Path resolved = Paths.get(filePath);

// ✅ Safe — restricts access to project directory
Path resolved = projectRoot.resolve(filePath).normalize();
if (!resolved.startsWith(projectRoot)) {
    throw new SecurityException("Path traversal detected");
}
```
```
