import { UnauthorizedClientError } from './UnauthorizedClientError.js';

export class RateLimitReachedError extends UnauthorizedClientError {
  public readonly resetTimestamp: string | undefined;
  public readonly resetDate: Date | undefined;

  constructor(clientId: string, audience: string, responseHeaders: Headers) {
    super(clientId, audience);

    this.resetTimestamp =
      responseHeaders['X-RateLimit-Reset'] ??
      responseHeaders['x-ratelimit-reset'];

    if (this.resetTimestamp) {
      this.resetDate = new Date(parseInt(this.resetTimestamp) * 1000);
    }
  }
}
