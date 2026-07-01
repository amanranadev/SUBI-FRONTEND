const isDev = process.env.NODE_ENV === "development"

export const logger = {
  warn: (message: string, context?: unknown): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(message, context)
    }
    // TODO: Forward warning logs to observability sink.
  },
  error: (message: string, context?: unknown): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(message, context)
    }
    // TODO: Forward error logs to observability sink.
  },
}
