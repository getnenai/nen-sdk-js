export class NenDesktopError extends Error {
  readonly statusCode: number;
  readonly responseBody: string;

  constructor(statusCode: number, responseBody: string) {
    super(`API error ${statusCode}: ${responseBody}`);
    this.name = "NenDesktopError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Thrown by the SDK's response adapters when the server's payload shape
 * doesn't match the expected contract (missing or wrong-typed required
 * fields). The HTTP request itself succeeded — it's the body that's bad —
 * so this is distinct from `NenDesktopError`, which carries a real HTTP
 * status. Mirrors the role of pydantic's `ValidationError` in the Python
 * SDK.
 */
export class NenDesktopContractError extends Error {
  readonly payload: unknown;

  constructor(message: string, payload: unknown) {
    super(`SDK contract error: ${message}`);
    this.name = "NenDesktopContractError";
    this.payload = payload;
  }
}
