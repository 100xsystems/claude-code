---
title: "Setting Up the CLI Framework"
description: "Build the command-line interface for Claude Code using Spring Shell"
order: 6
difficulty: "Intermediate"
---

# Setting Up the CLI Framework

The foundation of Claude Code is its command-line interface. We'll use Spring Shell to build a professional CLI.

## Spring Shell Setup

Add Spring Shell to `build.gradle`:

```groovy
implementation 'org.springframework.shell:spring-shell-starter:3.2.0'
```

## Creating Commands

```java
package com.claudecode.cli;

import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.shell.standard.ShellOption;

@ShellComponent
public class ClaudeCommands {

    @ShellMethod(value = "Ask Claude a coding question", key = "ask")
    public String ask(
        @ShellOption(value = "--prompt", help = "Your question or request") String prompt
    ) {
        return "Thinking about: " + prompt;
    }
}
```

## Knowledge Check

```knowledgecheck
{
  "question": "Why use Spring Shell instead of manually parsing command-line arguments with a switch statement?",
  "explanation": "Building a professional CLI involves much more than parsing arguments. Spring Shell handles edge cases like partial input, multi-value parameters, help text formatting, tab completion, and ANSI color support — features that would take weeks to implement from scratch. The annotation-based approach also makes adding new commands trivial: just add a method with @ShellMethod."
}
```
