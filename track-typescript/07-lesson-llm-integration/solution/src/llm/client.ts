/**
 * LLM API Client for the Claude Code agent.
 * Handles streaming and non-streaming communication with the Anthropic API.
 */

export interface LLMConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

const DEFAULT_CONFIG: LLMConfig = {
  model: 'claude-3-opus-20240229',
  maxTokens: 4096,
  temperature: 0.7,
  baseUrl: 'https://api.anthropic.com/v1',
};

export class LLMClient {
  private config: LLMConfig;
  private totalTokensUsed: number = 0;

  constructor(config?: Partial<LLMConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Send messages to the LLM and get a response.
   * Supports both streaming and non-streaming modes.
   */
  async send(messages: LLMMessage[], stream: boolean = false): Promise<LLMResponse> {
    // Simulate API call — in production, this calls the Anthropic SDK
    const simulatedTokens = this.estimateTokens(messages);

    if (stream) {
      return this.sendStreaming(messages, simulatedTokens);
    }

    return this.sendNonStreaming(messages, simulatedTokens);
  }

  private async sendNonStreaming(messages: LLMMessage[], estimatedTokens: number): Promise<LLMResponse> {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    const lastMessage = messages[messages.length - 1]?.content || '';
    const content = this.generateResponse(lastMessage);

    this.totalTokensUsed += estimatedTokens;

    return {
      content,
      tokensUsed: estimatedTokens,
      model: this.config.model,
    };
  }

  private async sendStreaming(messages: LLMMessage[], estimatedTokens: number): Promise<LLMResponse> {
    // Simulate streaming with token-by-token output
    const lastMessage = messages[messages.length - 1]?.content || '';
    const words = this.generateResponse(lastMessage).split(' ');

    let content = '';
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      process.stdout.write(word + ' ');
      content += word + ' ';
    }
    process.stdout.write('\n');

    this.totalTokensUsed += estimatedTokens;

    return {
      content: content.trim(),
      tokensUsed: estimatedTokens,
      model: this.config.model,
    };
  }

  /**
   * Generate a simulated LLM response based on the input.
   */
  private generateResponse(input: string): string {
    if (input.toLowerCase().includes('error') || input.toLowerCase().includes('fail')) {
      return `I encountered an issue processing your request. Let me analyze the problem and suggest a solution.`;
    }
    return `I'll help you with: "${input}". Let me work through this step by step.`;
  }

  /**
   * Estimate token count for a set of messages.
   * Rough estimate: ~4 characters per token.
   */
  private estimateTokens(messages: LLMMessage[]): number {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  /**
   * Get total tokens used across all requests.
   */
  getTotalTokensUsed(): number {
    return this.totalTokensUsed;
  }

  /**
   * Reset token counter.
   */
  resetTokenCount(): void {
    this.totalTokensUsed = 0;
  }

  /**
   * Get current configuration.
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}
