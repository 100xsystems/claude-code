---
title: "Implement the Write Tool"
description: "Let Claude Code create and modify files in the project"
order: 10
difficulty: "Advanced"
---

# Implement the Write Tool

The read tool lets Claude examine code. The write tool lets it **change** code. This is where Claude Code becomes truly useful.

## Writing vs Editing

There are two approaches to modifying files:

| Approach | When to Use |
|---|---|
| **Write entire file** | Creating new files, small files |
| **Edit specific lines** | Making targeted changes to large files |

For a practical agent, implement both. Start with simple whole-file writes.

## The Write Tool Definition

```java
public static ToolDefinition writeTool() {
    return new ToolDefinition(
        "write",
        "Write content to a file in the project. Creates the file if it doesn't exist, overwrites if it does.",
        Map.of(
            "type", "object",
            "properties", Map.of(
                "filePath", Map.of("type", "string", "description", "Path relative to project root"),
                "content", Map.of("type", "string", "description", "The full content to write")
            ),
            "required", java.util.List.of("filePath", "content")
        )
    );
}
```

## The Write Handler

```java
package com.claudecode.tools;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

public class WriteToolHandler implements ToolHandler {

    private final Path projectRoot;

    public WriteToolHandler() {
        this.projectRoot = Paths.get(System.getProperty("user.dir"));
    }

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.writeTool();
    }

    @Override
    public ToolResult execute(Map<String, Object> args) {
        try {
            var filePath = (String) args.get("filePath");
            var content = (String) args.get("content");
            var resolved = projectRoot.resolve(filePath).normalize();

            if (!resolved.startsWith(projectRoot)) {
                return new ToolResult(false, "Access denied: path outside project directory");
            }

            Files.createDirectories(resolved.getParent());
            Files.writeString(resolved, content);

            var fileSize = Files.size(resolved);
            return new ToolResult(true, String.format("Written %d bytes to %s", fileSize, filePath));

        } catch (IOException e) {
            return new ToolResult(false, "Error writing file: " + e.getMessage());
        }
    }
}
```

## Line-Level Editing

For large files, whole-file writes waste tokens:

```java
public class EditToolHandler implements ToolHandler {
    @Override
    public ToolResult execute(Map<String, Object> args) {
        var filePath = (String) args.get("filePath");
        var oldString = (String) args.get("oldString");
        var newString = (String) args.get("newString");

        try {
            var resolved = projectRoot.resolve(filePath).normalize();
            var content = Files.readString(resolved);

            if (!content.contains(oldString)) {
                return new ToolResult(false, "Could not find the specified text in the file.");
            }

            var updated = content.replace(oldString, newString);
            Files.writeString(resolved, updated);
            return new ToolResult(true, "Edit applied successfully");

        } catch (IOException e) {
            return new ToolResult(false, "Error editing file: " + e.getMessage());
        }
    }
}
```
```
