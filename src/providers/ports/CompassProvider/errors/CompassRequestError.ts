import { CompassErrors } from '../types/CompassErrors.js';
import { CompassError } from '../types/CompassError.js';

export class CompassRequestError extends Error {
  public errors: CompassError[];

  constructor(compassErrors: CompassErrors) {
    super(
      `Error fetching Compass data: ${compassErrors.errors.map((error) => error.message).join(', ')}`,
    );
    this.errors = compassErrors.errors;
  }
}
