/**
 * Abstract class representing a task that can be retried with an increasing delay.
 */
export abstract class RetryableTask {
  protected retries = 0;
  protected delay: number;

  /**
   * @param maxRetries - Optional number of retries.
   * @param initialDelay - Optional how much ms to wait on the first try.
   * @param backoffFactor - Optional number greater than one on how the waiting grows.
   */
  constructor(
    protected readonly maxRetries = 20,
    initialDelay = 1000,
    protected readonly backoffFactor = 1.2,
  ) {
    this.delay = initialDelay;
  }

  /**
   * Attempts to perform a given task. If the task fails, it retries with an increasing delay until
   * maximum retries are reached.
   *
   * @template T - The type of value that the callback returns.
   * @param {() => Promise<T>} callback - The asynchronous function representing the task to be retried.
   * @returns {Promise<T>} A promise that resolves to the result of the task or rejects with an error.
   * @throws {Error} Throws an error if maximum retries are reached.
   */
  protected backoffAndRetry<T>(callback: () => Promise<T>): Promise<T> {
    if (this.retries >= this.maxRetries) {
      throw new Error('Max retries reached');
    }
    this.retries++;
    this.delay *= this.backoffFactor;

    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        callback().then(resolve, reject);
      }, this.delay);
    });
  }
}
