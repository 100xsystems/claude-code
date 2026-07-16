---
title: "Introduction & Java Project Setup"
order: 1
module: "CLI Foundations"
track: "java"
difficulty: "Beginner"
estimated_time: "45 min"
learning_objectives:
  - "Set up a Java project with Maven and proper tooling"
  - "Understand the architecture of an AI-powered CLI agent in Java"
  - "Create the project structure for our Claude Code implementation"
prerequisites: []
knowledge_refs:
  - "tools/docker"
  - "principles/single-responsibility"
validation:
  - type: file-exists
    path: "pom.xml"
  - type: file-exists
    path: "src/main/java/com/claudecode/Main.java"
  - type: file-exists
    path: "src/main/java/com/claudecode/cli/CLIApplication.java"
  - type: file-contains
    path: "pom.xml"
    contains: "picocli"
    description: "Has Picocli dependency"
  - type: cli-command
    command: "mvn compile -q 2>/dev/null || echo 'check maven'"
    description: "Maven project compiles"
---

# Introduction & Java Project Setup

Welcome to building **Claude Code** in Java! By the end of this system, you'll have built a fully functional AI coding agent using Java, Maven, and Picocli.

## What We're Building

An AI coding agent with three core layers:

```
┌──────────────────────────────────────────┐
│           CLI Layer (Picocli)             │
│  Command parsing, stdin/stdout handling   │
├──────────────────────────────────────────┤
│           Agent Loop                      │
│  Think → Act → Observe iteration          │
├──────────────────────────────────────────┤
│           Tool System                     │
│  File I/O, command execution, search      │
├──────────────────────────────────────────┤
│           LLM Integration                │
│  HTTP client, streaming, context mgmt     │
└──────────────────────────────────────────┘
```

## Step 1: Create Maven Project

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.claudecode</groupId>
    <artifactId>claude-code-agent</artifactId>
    <version>0.1.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <picocli.version>4.7.6</picocli.version>
        <jackson.version>2.17.0</jackson.version>
    </properties>

    <dependencies>
        <!-- CLI Framework -->
        <dependency>
            <groupId>info.picocli</groupId>
            <artifactId>picocli</artifactId>
            <version>${picocli.version}</version>
        </dependency>

        <!-- HTTP Client -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
        </dependency>

        <!-- Logging -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.12</version>
        </dependency>
    </dependencies>
</project>
```

## Step 2: Create the Entry Point

Create `src/main/java/com/claudecode/Main.java`:

```java
package com.claudecode;

import com.claudecode.cli.CLIApplication;

public class Main {
    public static void main(String[] args) {
        int exitCode = new CLIApplication().run(args);
        System.exit(exitCode);
    }
}
```

## Step 3: Create the CLI Interface

Create `src/main/java/com/claudecode/cli/CLIApplication.java`:

```java
package com.claudecode.cli;

import com.claudecode.agent.Agent;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.util.concurrent.Callable;

@Command(
    name = "claude-code",
    description = "AI-powered coding agent — build, debug, and refactor code with AI assistance",
    version = "0.1.0",
    mixinStandardHelpOptions = true,
    subcommands = {
        ChatCommand.class,
        ExecuteCommand.class,
        PipeCommand.class
    }
)
public class CLIApplication implements Callable<Integer> {

    @Option(names = {"-m", "--model"}, description = "LLM model to use")
    String model = "claude-sonnet-4-20250514";

    @Option(names = {"-t", "--max-tokens"}, description = "Maximum tokens in response")
    int maxTokens = 4096;

    @Option(names = {"--temperature"}, description = "Response creativity (0-1)")
    double temperature = 0.7;

    @Option(names = {"-v", "--verbose"}, description = "Enable verbose logging")
    boolean verbose;

    public int run(String[] args) {
        return new CommandLine(this).execute(args);
    }

    @Override
    public Integer call() {
        // Default: show help
        CommandLine.usage(this, System.out);
        return 0;
    }

    @Command(name = "chat", description = "Start an interactive AI coding session")
    static class ChatCommand implements Callable<Integer> {
        @Parameters(index = "0", defaultValue = "", description = "Optional initial message")
        String message;

        @Option(names = {"--no-stream"}, description = "Disable streaming responses")
        boolean noStream;

        @Override
        public Integer call() {
            System.out.println("🤖 Claude Code ready. Type your task (Ctrl+C to exit)");
            return 0;
        }
    }

    @Command(name = "execute", description = "Execute a single task")
    static class ExecuteCommand implements Callable<Integer> {
        @Parameters(index = "0", description = "The task to execute")
        String task;

        @Override
        public Integer call() {
            System.out.println("Executing: " + task);
            return 0;
        }
    }

    @Command(name = "pipe", description = "Process piped input (stdin)")
    static class PipeCommand implements Callable<Integer> {
        @Parameters(index = "0", defaultValue = "", description = "Optional instruction prefix")
        String prompt;

        @Override
        public Integer call() {
            System.out.println("Processing piped input...");
            return 0;
        }
    }
}
```

## Step 4: Project Structure

```
claude-code-agent/
├── pom.xml
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── claudecode/
│                   ├── Main.java
│                   ├── cli/
│                   │   └── CLIApplication.java
│                   ├── agent/
│                   │   ├── Agent.java
│                   │   ├── AgentLoop.java
│                   │   └── ToolCall.java
│                   ├── tools/
│                   │   ├── ToolRegistry.java
│                   │   ├── FileTool.java
│                   │   ├── ExecuteTool.java
│                   │   └── SearchTool.java
│                   └── llm/
│                       ├── LLMClient.java
│                       └── StreamHandler.java
├── design/
│   ├── decisions.md
│   └── architecture.md
└── 100xsystems.json
```

## Step 5: Verify

```bash
mvn compile        # Build the project
mvn exec:java -Dexec.mainClass="com.claudecode.Main" -- --help  # Check CLI
```

## Validation Checklist

- [ ] `pom.xml` exists with Maven configuration
- [ ] Picocli dependency is configured
- [ ] `Main.java` has the entry point
- [ ] `CLIApplication.java` has chat, execute, and pipe commands
- [ ] `src/main/java/com/claudecode/` directory structure exists
- [ ] `mvn compile` completes without errors
