/**
 * StreamProcessor handles both streaming and non-streaming modes
 * for LLM response processing.
 */
export class StreamProcessor {
  /**
   * Process input text with optional streaming.
   * In streaming mode, tokens are printed as they arrive.
   * In non-streaming mode, the full response is buffered and returned.
   */
  async process(input: string, stream: boolean = true): Promise<string> {
    if (stream) {
      return this.processStreaming(input);
    }
    return this.processBuffered(input);
  }

  private async processStreaming(input: string): Promise<string> {
    // Simulate streaming by processing in chunks
    const tokens = input.split(' ');
    const chunks: string[] = [];

    for (const token of tokens) {
      // Simulate async token arrival
      await new Promise((resolve) => setTimeout(resolve, 10));
      process.stdout.write(token + ' ');
      chunks.push(token);
    }
    process.stdout.write('\n');

    return chunks.join(' ');
  }

  private async processBuffered(input: string): Promise<string> {
    // Simulate non-streaming processing
    await new Promise((resolve) => setTimeout(resolve, 100));
    return `Processed: ${input}`;
  }
}
