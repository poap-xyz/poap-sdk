import {
  TokensApiProvider,
  Transaction,
  TransactionStatus,
} from '../../providers';
import { FinishedWithError } from '../errors/FinishedWithError';
import { RetryableTask } from './RetryableTask';

/**
 * A utility class designed to continually check the status of a POAP token mint.
 * If a mint is still pending or in process, it implements a backoff retry mechanism.
 */
export class MintChecker extends RetryableTask {
  /**
   * Constructs a new instance of the MintChecker class.
   *
   * @param tokensApiProvider - The provider to fetch the mint status.
   * @param mintCode - The unique code for the token mint.
   */
  constructor(
    private readonly tokensApiProvider: TokensApiProvider,
    private readonly mintCode: string,
  ) {
    super();
  }

  /**
   * Checks the current status of a token mint.
   * If the mint is still pending or in process, it will retry the check with an increased delay.
   *
   * @returns A promise that resolves once the status has been checked.
   * @throws {FinishedWithError} Throws an error if the minting process finished with an error.
   */
  public async checkMintStatus(): Promise<void> {
    try {
      const transaction = await this.tokensApiProvider.getMintTransaction(
        this.mintCode,
      );

      if (this.shouldRetry(transaction)) {
        await this.backoffAndRetry(() => this.checkMintStatus());
      } else {
        this.handleErrorStatus(transaction);
      }
    } catch (error: unknown) {
      if (error instanceof FinishedWithError) {
        throw error;
      }

      await this.backoffAndRetry(() => this.checkMintStatus());
    }
  }

  /**
   * Determines if a retry should be performed based on the provided minting status.
   *
   * @returns True if a retry should be performed, otherwise false.
   * @param transaction The transaction to check for retry.
   */
  private shouldRetry(transaction: Transaction | null): boolean {
    return !transaction || transaction.status === TransactionStatus.pending;
  }

  /**
   * Handles any error statuses from the mint status response.
   * If the minting process finishes with an error, an exception will be thrown.
   *
   * @param transaction The transaction to check for errors.
   * @throws {FinishedWithError} Throws an error if the minting process finished with an error.
   */
  private handleErrorStatus(transaction: Transaction | null): void {
    if (transaction?.status === TransactionStatus.failed) {
      throw new FinishedWithError(
        'The Transaction associated with this mint failed',
        this.mintCode,
      );
    }
  }
}
