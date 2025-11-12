export class UnauthorizedClientError extends Error {
  constructor(
    public readonly clientId: string,
    public readonly audience: string,
  ) {
    super(
      `Could not authenticate to ${audience}: Unauthorized client: ${clientId}`,
    );
  }
}
