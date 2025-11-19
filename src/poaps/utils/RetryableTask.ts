import { TokensApiProvider } from '../../providers/index.js';

const MAX_RETRIES = 20;
const INITIAL_DELAY = 1000;
const BACKOFF_FACTOR = 1.2;

/**
 * Abstract class representing a task that can be retried with an increasing delay.
 */
export abstract class RetryableTask {
  protected retries = 0;
  protected delay: number = INITIAL_DELAY;
  protected tokensApiProvider: TokensApiProvider;

  /**
   * Constructs a new RetryableTask instance.
   *
   * @param {TokensApiProvider} tokensApiProvider - The provider used to perform operations that might be retried.
   */
  constructor(tokensApiProvider: TokensApiProvider) {
    this.tokensApiProvider = tokensApiProvider;
  }

  /**
   * Attempts to perform a given task. If the task fails, it retries with an increasing delay until
   * maximum retries are reached.
   *
   * @protected
   * @template T - The type of value that the callback returns.
   * @param {() => Promise<T>} callback - The asynchronous function representing the task to be retried.
   * @returns {Promise<T>} A promise that resolves to the result of the task or rejects with an error.
   * @throws {Error} Throws an error if maximum retries are reached.
   */
  protected backoffAndRetry<T>(callback: () => Promise<T>): Promise<T> {
    if (this.retries >= MAX_RETRIES) {
      throw new Error('Max retries reached');
    }
    this.retries++;
    this.delay *= BACKOFF_FACTOR;

    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        callback().then(resolve, reject);
      }, this.delay);
    });
  }
}
