type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LEVELS: Record<LogLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] <= LEVELS[currentLevel];
}

function format(level: LogLevel, message: string, context?: string): string {
  const timestamp = new Date().toISOString();
  return context
    ? `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`
    : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export function createLogger(context: string) {
  return {
    error(message: string, err?: unknown) {
      if (!shouldLog('error')) return;
      const detail = err instanceof Error ? `: ${err.message}` : '';
      console.error(format('error', message + detail, context));
    },
    warn(message: string) {
      if (!shouldLog('warn')) return;
      console.warn(format('warn', message, context));
    },
    info(message: string) {
      if (!shouldLog('info')) return;
      console.log(format('info', message, context));
    },
    debug(message: string) {
      if (!shouldLog('debug')) return;
      console.debug(format('debug', message, context));
    },
  };
}
