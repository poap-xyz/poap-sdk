export class CodeExpiredError extends Error {
  constructor(public readonly mintCode: string) {
    super(`Code: '${mintCode}', has been expired`);
  }
}
