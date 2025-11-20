export class InvalidAddressError extends Error {
  constructor(input: string) {
    super(`Address '${input}' is invalid`);
  }
}
