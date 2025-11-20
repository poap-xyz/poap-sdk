export class MintCodeNotFoundError extends Error {
  constructor(qrHash: string) {
    super(`Mint code '${qrHash}' not found`);
  }
}
