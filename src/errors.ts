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
