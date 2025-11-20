import {
  TokensApiProvider,
  Transaction,
  TransactionStatus,
} from '../../providers';
import { PoapMintFinishedWithError } from '../errors/PoapMintFinishedWithError';
import { PoapMintPendingError } from '../errors/PoapMintPendingError';
import { PoapMintTransaction } from '../types/PoapMintTransaction';
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
   * @param maxRetries - Optional number of retries.
   * @param initialDelay - Optional how much ms to wait on the first try.
   * @param backoffFactor - Optional number greater than one on how the waiting grows.
   */
  constructor(
    private readonly tokensApiProvider: TokensApiProvider,
    private readonly mintCode: string,
    maxRetries?: number,
    initialDelay?: number,
    backoffFactor?: number,
  ) {
    super(maxRetries, initialDelay, backoffFactor);
  }

  /**
   * Checks the current status of a token mint.
   * If the mint is still pending or in process, it will retry the check with an increased delay.
   *
   * @returns A promise that resolves once the status has been checked.
   * @throws {PoapMintFinishedWithError} Throws an error if the minting process finished with an error.
   * @throws {PoapMintPendingError} Throws when the maximum retries has been elapsed and the mint is not yet finished.
   */
  // eslint-disable-next-line complexity, max-statements
  public async checkMintStatus(): Promise<PoapMintTransaction> {
    try {
      const transaction = await this.tokensApiProvider.getMintTransaction(
        this.mintCode,
      );

      if (this.shouldRetry(transaction)) {
        return await this.backoffAndRetry(() => this.checkMintStatus());
      }

      if (transaction?.status === TransactionStatus.passed) {
        return { txHash: transaction.tx_hash };
      }

      this.handleErrorStatus(transaction);

      throw new PoapMintPendingError(this.mintCode);
    } catch (error: unknown) {
      if (error instanceof PoapMintFinishedWithError) {
        throw error;
      }

      return await this.backoffAndRetry(() => this.checkMintStatus());
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
   * @throws {PoapMintFinishedWithError} Throws an error if the minting process finished with an error.
   */
  private handleErrorStatus(transaction: Transaction | null): void {
    if (transaction?.status === TransactionStatus.failed) {
      throw new PoapMintFinishedWithError(
        'The Transaction associated with this mint failed',
        this.mintCode,
      );
    }
  }
}
