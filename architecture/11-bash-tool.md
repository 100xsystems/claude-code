---
title: "Implement the Bash Tool"
description: "Let Claude Code run terminal commands and see their output"
order: 11
difficulty: "Advanced"
---

# Implement the Bash Tool

The most powerful tool in Claude Code is the ability to **run commands**. With bash access, Claude can install dependencies, run tests, start servers, and debug issues.

## The Bash Tool Definition

```java
public static ToolDefinition bashTool() {
    return new ToolDefinition(
        "bash",
        "Execute a bash command in the project's terminal.",
        Map.of(
            "type", "object",
            "properties", Map.of(
                "command", Map.of("type", "string", "description", "The bash command to execute"),
                "timeout", Map.of("type", "number", "description", "Maximum execution time in seconds", "default", 30)
            ),
            "required", java.util.List.of("command")
        )
    );
}
```

## The Bash Handler

```java
package com.claudecode.tools;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class BashToolHandler implements ToolHandler {

    private final Path projectRoot;

    public BashToolHandler() {
        this.projectRoot = Paths.get(System.getProperty("user.dir"));
    }

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.bashTool();
    }

    @Override
    public ToolResult execute(Map<String, Object> args) {
        var command = (String) args.get("command");
        var timeout = args.containsKey("timeout") ? ((Number) args.get("timeout")).intValue() : 30;

        try {
            var processBuilder = new ProcessBuilder("bash", "-c", command);
            processBuilder.directory(projectRoot.toFile());
            processBuilder.redirectErrorStream(true);

            var process = processBuilder.start();
            var output = new StringBuilder();
            var reader = new Thread(() -> {
                try (var br = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = br.readLine()) != null) { output.append(line).append("\n"); }
                } catch (IOException e) { }
            });
            reader.start();

            boolean finished = process.waitFor(timeout, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return new ToolResult(false, "Command timed out after " + timeout + " seconds:\n" + output);
            }

            reader.join(1000);
            int exitCode = process.exitValue();
            var result = output.toString();

            if (result.length() > 50_000) {
                result = result.substring(0, 50_000) + "\n... [output truncated]";
            }

            return new ToolResult(exitCode == 0, String.format("Exit code: %d\n%s", exitCode, result));

        } catch (Exception e) {
            return new ToolResult(false, "Error executing command: " + e.getMessage());
        }
    }
}
```

## Sandboxing Commands

For safety, implement command allowlists and blocklists:

```java
public class CommandValidator {
    private static final java.util.Set<String> BLOCKED_PREFIXES = java.util.Set.of(
        "rm -rf /", "sudo ", "reboot", "shutdown", ":(){ :|:& };:", "dd if=", "mkfs"
    );

    public static boolean isSafe(String command) {
        var lower = command.toLowerCase().trim();
        for (var prefix : BLOCKED_PREFIXES) {
            if (lower.startsWith(prefix)) return false;
        }
        return true;
    }
}
```
```
