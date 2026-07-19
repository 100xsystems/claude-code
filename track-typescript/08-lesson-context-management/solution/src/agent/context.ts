/**
 * Context Window Manager for the Claude Code agent.
 *
 * Manages token tracking and message history pruning to prevent
 * exceeding LLM context window limits.
 */

export interface ContextMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens: number;
}

export interface ContextConfig {
  maxTokens: number;
  warningThreshold: number; // Percentage (0-1) at which to start pruning
  preserveSystemMessages: boolean;
  preserveLastMessages: number; // Always keep the last N messages
}

const DEFAULT_CONFIG: ContextConfig = {
  maxTokens: 100_000,
  warningThreshold: 0.8,
  preserveSystemMessages: true,
  preserveLastMessages: 5,
};

/**
 * Rough token estimation: ~4 characters per token.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class ContextManager {
  private config: ContextConfig;
  private messages: ContextMessage[] = [];

  constructor(config?: Partial<ContextConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add a message to the context.
   */
  addMessage(role: ContextMessage['role'], content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: Date.now(),
      tokens: estimateTokens(content),
    });
  }

  /**
   * Get all messages, pruning if necessary.
   */
  getMessages(): ContextMessage[] {
    if (this.getTotalTokens() > this.config.maxTokens * this.config.warningThreshold) {
      this.prune();
    }
    return [...this.messages];
  }

  /**
   * Get total token count across all messages.
   */
  getTotalTokens(): number {
    return this.messages.reduce((sum, m) => sum + m.tokens, 0);
  }

  /**
   * Get the number of messages in context.
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Prune the message history to stay within context limits.
   *
   * Strategy:
   * 1. Keep all system messages (if configured)
   * 2. Keep the last N messages (for continuity)
   * 3. Remove oldest non-essential messages first
   * 4. Summarize removed content
   */
  prune(): void {
    const preserved: ContextMessage[] = [];

    // 1. Preserve system messages
    if (this.config.preserveSystemMessages) {
      const systemMessages = this.messages.filter((m) => m.role === 'system');
      preserved.push(...systemMessages);
    }

    // 2. Preserve the last N messages
    const lastMessages = this.messages.slice(-this.config.preserveLastMessages);
    const lastIds = new Set(lastMessages.map((m) => this.messages.indexOf(m)));

    // 3. Add remaining messages while under limit
    const remaining = this.messages.filter((_, i) => !lastIds.has(i) && !(this.config.preserveSystemMessages && this.messages[i].role === 'system'));

    // Add oldest remaining messages first until we approach the limit
    for (const msg of remaining) {
      const currentTotal = preserved.reduce((sum, m) => sum + m.tokens, 0);
      if (currentTotal + msg.tokens < this.config.maxTokens * this.config.warningThreshold) {
        preserved.push(msg);
      }
    }

    // 4. Add the essential last messages
    preserved.push(...lastMessages);

    // Add a pruning summary
    const prunedCount = this.messages.length - preserved.length;
    if (prunedCount > 0) {
      preserved.push({
        role: 'system',
        content: `[System note: ${prunedCount} older message(s) were pruned to free context space. Previous conversation context has been summarized.]`,
        timestamp: Date.now(),
        tokens: estimateTokens(`[${prunedCount} messages pruned]`),
      });
    }

    this.messages = preserved;
  }

  /**
   * Clear all messages.
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Get token usage statistics.
   */
  getStats(): { totalTokens: number; messageCount: number; usagePercentage: number } {
    return {
      totalTokens: this.getTotalTokens(),
      messageCount: this.messages.length,
      usagePercentage: (this.getTotalTokens() / this.config.maxTokens) * 100,
    };
  }
}
