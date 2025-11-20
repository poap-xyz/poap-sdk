export class MintCodeAlreadyUsedError extends Error {
  constructor(qrHash: string) {
    super(`Mint code '${qrHash}' already used`);
  }
}
