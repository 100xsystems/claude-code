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
  - type: test-runner
    test_file: "tests/Lesson1Test.java"
    framework: junit
    timeout: 180000
---

# Introduction & Java Project Setup

Welcome to building **Claude Code** — an AI-powered coding agent that operates directly in your terminal. In this Java track, we'll implement the agent using Maven, Picocli, and the Java HTTP client.

## What We're Building

An AI coding agent has three core layers:

```
User Input (terminal)
       │
       ▼
┌──────────────────────┐
│    CLI Layer          │  ← Picocli: parse commands, flags, args
│  (CLIApplication.java)│
└─────────┬───────────┘
          │
          ▼
┌──────────────────────┐
│    Agent Loop         │  ← Think → Act → Observe
│  (Agent.java)         │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────┐
│    Tool System        │  ← File I/O, execute, search
│  (tools/ directory)   │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────┐
│    LLM Integration   │  ← HTTP client, streaming
│  (llm/ directory)    │
└──────────────────────┘
```

## Step 1: Configure Your Maven Project

Create `pom.xml` in the project root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.claudecode</groupId>
    <artifactId>claude-code-agent</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- CLI Framework -->
        <dependency>
            <groupId>info.picocli</groupId>
            <artifactId>picocli</artifactId>
            <version>4.7.6</version>
        </dependency>

        <!-- JSON Processing -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.17.0</version>
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

## Step 2: Define the Main Entry Point

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

## Step 3: Define the CLI Interface

Create `src/main/java/com/claudecode/cli/CLIApplication.java`:

```java
package com.claudecode.cli;

import picocli.CommandLine;
import picocli.CommandLine.Command;

@Command(
    name = "claude-code",
    description = "AI-powered coding agent",
    version = "0.1.0",
    mixinStandardHelpOptions = true,
    subcommands = {
        CommandLine.HelpCommand.class
    }
)
public class CLIApplication implements Runnable {

    @Override
    public void run() {
        CommandLine.usage(this, System.out);
    }

    public int run(String[] args) {
        return new CommandLine(this).execute(args);
    }
}
```

## Step 4: Verify Your Setup

Create the planned directory structure:

```
src/main/java/com/claudecode/
├── Main.java              (created above)
├── cli/
│   └── CLIApplication.java (created above)
├── agent/
│   └── Agent.java          (next lesson)
├── tools/
│   └── ToolRegistry.java   (future lesson)
└── llm/
    └── LLMClient.java      (future lesson)
```

## Step 5: Verify

```bash
# Should compile without errors
mvn compile -q

# Should show help text
mvn exec:java -Dexec.mainClass="com.claudecode.Main" -- --help
```

## Validation Checklist

- [ ] `pom.xml` exists with Picocli and Jackson dependencies
- [ ] `Main.java` exists with entry point logic
- [ ] `CLIApplication.java` exists with Picocli command definition
- [ ] Maven compile succeeds
