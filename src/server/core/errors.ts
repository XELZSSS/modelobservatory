export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class ValidationError extends ApiError {
  constructor(msg: string) {
    super(msg, 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(msg = "Not found") {
    super(msg, 404);
    this.name = "NotFoundError";
  }
}

export class UpstreamError extends ApiError {
  source?: string;
  constructor(message: string, opts?: { source?: string; status?: number }) {
    super(message, opts?.status ?? 503);
    this.name = "UpstreamError";
    this.source = opts?.source;
  }
}

export class ParseError extends ApiError {
  source?: string;
  constructor(message: string, source?: string) {
    super(message, 500);
    this.name = "ParseError";
    this.source = source;
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function describeError(e: unknown): { message: string; status: number; source?: string } {
  if (e instanceof ApiError) {
    return { message: e.message, status: e.status, source: (e as ApiError & { source?: string }).source };
  }
  return { message: errorMessage(e), status: 500 };
}