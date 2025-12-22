import { isValidEnsFormat } from '../../utils/validation/isValidEnsFormat.js';
import { isValidEthereumAddressFormat } from '../../utils/validation/isValidEthereumAddressFormat.js';

export class ProfilesQueryNormalizer {
  static normalizeQuery(query: string): string | null {
    if (!isValidEnsFormat(query) && isValidEthereumAddressFormat(query)) {
      return null;
    }
    return query.toLowerCase();
  }

  static normalizeQueries(queries: string[]): string[] {
    return queries
      .map((query) => this.normalizeQuery(query))
      .filter((query): query is string => query !== null);
  }
}
