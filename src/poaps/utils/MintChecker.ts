import {
  TokensApiProvider,
  Transaction,
  TransactionStatus,
} from '../../providers/index.js';
import { FinishedWithError } from '../errors/FinishedWithError.js';
import { RetryableTask } from './RetryableTask.js';

/**
 * A utility class designed to continually check the status of a POAP token mint.
 * If a mint is still pending or in process, it implements a backoff retry mechanism.
 */
export class MintChecker extends RetryableTask {
  private mintCode: string;

  /**
   * Constructs a new instance of the MintChecker class.
   *
   * @param {string} mintCode - The unique code for the token mint.
   * @param {TokensApiProvider} tokensApiProvider - The provider to fetch the mint status.
   */
  constructor(tokensApiProvider: TokensApiProvider, mintCode: string) {
    super(tokensApiProvider);
    this.mintCode = mintCode;
  }

  /**
   * Checks the current status of a token mint.
   * If the mint is still pending or in process, it will retry the check with an increased delay.
   *
   * @public
   * @returns {Promise<void>} A promise that resolves once the status has been checked.
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
        this.handleErrorStatus(transaction, this.mintCode);
      }
    } catch (e) {
      if (e instanceof FinishedWithError) {
        throw e;
      }

      await this.backoffAndRetry(() => this.checkMintStatus());
    }
  }

  /**
   * Determines if a retry should be performed based on the provided minting status.
   *
   * @private
   * @returns {boolean} Returns true if a retry should be performed, otherwise false.
   * @param transaction - The transaction to check for retry.
   */
  private shouldRetry(transaction: Transaction | null): boolean {
    return !transaction || transaction.status === TransactionStatus.pending;
  }

  /**
   * Handles any error statuses from the mint status response.
   * If the minting process finishes with an error, an exception will be thrown.
   *
   * @private
   * @param {Transaction} transaction - The transaction to check for errors.
   * @param mintCode
   * @throws {FinishedWithError} Throws an error if the minting process finished with an error.
   */
  private handleErrorStatus(
    transaction: Transaction | null,
    mintCode: string,
  ): void {
    if (transaction?.status === TransactionStatus.failed) {
      throw new FinishedWithError(
        'The Transaction associated with this mint failed',
        mintCode,
      );
    }
  }
}
