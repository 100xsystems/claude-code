/**
 * Streaming response handler for SSE (Server-Sent Events) from LLM APIs.
 *
 * Processes incoming data chunks and emits tokens via callbacks.
 */

export interface StreamProcessorOptions {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export class StreamProcessor {
  private onToken: (token: string) => void;
  private onComplete: () => void;
  private onError: (error: Error) => void;
  private buffer: string;

  constructor(options: StreamProcessorOptions) {
    this.onToken = options.onToken;
    this.onComplete = options.onComplete;
    this.onError = options.onError;
    this.buffer = '';
  }

  /**
   * Process a single SSE chunk.
   * Expected format: "data: {\"delta\":{\"text\":\"Hello\"}}\n"
   */
  processChunk(chunk: string): void {
    this.buffer += chunk;

    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith(':')) {
        // Comment or empty line — skip
        continue;
      }

      if (trimmed === 'data: [DONE]') {
        this.onComplete();
        return;
      }

      if (trimmed.startsWith('data: ')) {
        try {
          const jsonStr = trimmed.slice(6);
          const data = JSON.parse(jsonStr);

          if (data.delta?.text) {
            this.onToken(data.delta.text);
          }
        } catch {
          // Malformed JSON — surface via onError
          this.onError(new Error(`Failed to parse SSE data: ${trimmed}`));
        }
      }
    }
  }

  /**
   * Signal that the stream has ended.
   * Calls onComplete if not already called.
   */
  finish(): void {
    this.onComplete();
  }
}
