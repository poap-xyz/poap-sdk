export class PoapMintPendingError extends Error {
  constructor(public readonly mintCode: string) {
    super(`Mint code '${mintCode}' is still pending`);
  }
}
