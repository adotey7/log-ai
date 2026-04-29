export interface SDKConfig {
  endpoint: string;
  autoCapture?: boolean;
  maxStackLines?: number;
}

export interface LogPayload {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  language: string;
  viewport: { width: number; height: number };
  context?: Record<string, unknown>;
}

const DEFAULT_CONFIG: Required<Pick<SDKConfig, 'autoCapture' | 'maxStackLines'>> = {
  autoCapture: true,
  maxStackLines: 50,
};

export class AiLogger {
  private config: SDKConfig & typeof DEFAULT_CONFIG;
  private originalOnError: OnErrorEventHandler | null = null;
  private originalOnUnhandledRejection: ((event: PromiseRejectionEvent) => void) | null = null;

  constructor(config: SDKConfig) {
    if (typeof window === 'undefined') {
      console.warn('[AiLogger] SDK is browser-only and cannot be used in Node.js');
      // Provide a safe no-op config so downstream code doesn't crash
      this.config = { ...DEFAULT_CONFIG, endpoint: '' };
      return;
    }

    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.autoCapture) {
      this.setupGlobalHandlers();
    }
  }

  private setupGlobalHandlers(): void {
    this.originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (error) {
        this.log(error);
      } else {
        this.captureMessage(String(message), { source, lineno, colno });
      }
      if (this.originalOnError) {
        return this.originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    this.originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      if (reason instanceof Error) {
        this.log(reason);
      } else {
        this.captureMessage(String(reason));
      }
      if (this.originalOnUnhandledRejection) {
        this.originalOnUnhandledRejection(event);
      }
    };
  }

  async log(error: Error, context?: Record<string, unknown>): Promise<void> {
    const payload = this.buildPayload(error.message, error.stack, context);
    await this.send(payload);
  }

  async captureMessage(message: string, context?: Record<string, unknown>): Promise<void> {
    const payload = this.buildPayload(message, undefined, context);
    await this.send(payload);
  }

  private buildPayload(message: string, stack?: string, context?: Record<string, unknown>): LogPayload {
    const truncatedStack = stack
      ? stack.split('\n').slice(0, this.config.maxStackLines).join('\n')
      : undefined;

    return {
      message,
      stack: truncatedStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
    };
  }

  private async send(payload: LogPayload): Promise<void> {
    if (!this.config.endpoint) {
      console.warn('[AiLogger] Not initialized with a valid endpoint.');
      return;
    }

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Silent fail — never crash the host app
      console.warn('[AiLogger] Failed to send log:', err);
    }
  }
}

export default AiLogger;
