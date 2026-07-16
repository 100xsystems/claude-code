---
title: "Introduction to Claude Code"
description: "Understand what we're building and the system architecture"
order: 5
difficulty: "Beginner"
---

# Introduction to Claude Code

Welcome! In this system, you'll build **Claude Code** — an AI-powered CLI coding assistant that helps developers write, debug, and understand code directly from the terminal.

## What We're Building

Claude Code is an interactive terminal application that uses AI to understand natural language prompts. You can ask it to explain code, generate new features, find bugs, refactor, and much more — all without leaving your terminal.

Think of it as having a senior engineer pair-programming with you, right in your command line.

## Project Setup (Java)

We'll use Spring Boot for the backend API and CLI framework:

```bash
curl https://start.spring.io/starter.zip \
  -d type=gradle-project \
  -d language=java \
  -d bootVersion=3.2.0 \
  -d groupId=com.claudecode \
  -d artifactId=claude-code \
  -d javaVersion=21 \
  -d dependencies=web,actuator,validation,lombok \
  -o claude-code.zip

unzip claude-code.zip -d claude-code
cd claude-code
```

## System Architecture

The system consists of four main components:

1. **CLI Interface** — Java console application for terminal interaction
2. **AI Service** — Service that communicates with the AI model API
3. **Session Manager** — Maintains conversation context and history
4. **File System Agent** — Reads and modifies project files

## Knowledge Check

```knowledgecheck
{
  "question": "Why do we use Spring Boot for Claude Code instead of building a simple CLI app with just a main method?",
  "explanation": "Building a production-grade CLI tool involves more than just parsing arguments. Claude Code needs HTTP clients for API calls, structured configuration management, retry logic, logging, and plugin support. Spring Boot provides these capabilities through its ecosystem — dependency injection, auto-configuration, and battle-tested HTTP clients. Without it, you'd spend weeks reinventing infrastructure that already exists."
}
```
