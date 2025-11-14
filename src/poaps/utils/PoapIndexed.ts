import { RetryableTask } from './RetryableTask';
import { PoapMintStatus } from '../types/PoapMintStatus';
import { TokensApiProvider } from '../../providers';

/**
 * @class PoapIndexed
 * @extends {RetryableTask}
 *
 * Represents a utility class designed to periodically check if a POAP token is indexed on our database.
 * This class extends `RetryableTask` to utilize its backoff retry mechanism in case the token hasn't been indexed yet.
 */
export class PoapIndexed extends RetryableTask {
  /**
   * Creates an instance of the PoapIndexed class.
   *
   * @param tokensApiProvider - An instance of the TokensApiProvider used to check the indexing status of the token.
   * @param mintCode - A unique Mint Code representing the token.
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
   * Periodically checks if the POAP token, represented by its Mint Code, is indexed on our database.
   * This method will continue retrying with an increasing delay until either the token is indexed or it reaches the maximum allowed retries.
   *
   * @returns A promise that either resolves with the indexed token's mint code response or rejects due to reaching the max retry limit.
   */
  public async waitPoapIndexed(): Promise<PoapMintStatus> {
    let response = await this.tokensApiProvider.getMintCode(this.mintCode);
    while (response.result == null) {
      response = await this.backoffAndRetry(() =>
        this.tokensApiProvider.getMintCode(this.mintCode),
      );
    }
    return {
      minted: response.claimed,
      isActive: response.is_active,
      poapId: response.result?.token,
    };
  }
}
