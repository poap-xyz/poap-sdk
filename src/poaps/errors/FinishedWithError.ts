export class FinishedWithError extends Error {
  constructor(
    public readonly reason: string,
    public readonly mintCode: string,
  ) {
    super(
      `Code: '${mintCode}', finished with error: '${reason}', please try again later `,
    );
  }
}
