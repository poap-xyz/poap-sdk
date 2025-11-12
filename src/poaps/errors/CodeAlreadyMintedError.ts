export class CodeAlreadyMintedError extends Error {
  constructor(public readonly mintCode: string) {
    super(`Code: '${mintCode}' already minted `);
  }
}
