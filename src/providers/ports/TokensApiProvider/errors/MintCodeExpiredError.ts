export class MintCodeExpiredError extends Error {
  constructor(qrHash: string) {
    super(`Mint code '${qrHash}' already expired`);
  }
}
