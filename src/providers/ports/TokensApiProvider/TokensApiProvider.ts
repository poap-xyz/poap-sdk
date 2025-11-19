import { MintCodeInput } from './types/MintCodeInput.js';
import {
  GetMintCodeResponse,
  PostMintCodeResponse,
} from './types/MintCodeResponse.js';
import { Transaction } from './types/Transaction.js';

/**
 * Provides methods for interacting with a Tokens API.
 *
 * @interface TokensApiProvider
 */
export interface TokensApiProvider {
  getMintCode(code: string): Promise<GetMintCodeResponse>;

  postMintCode(input: MintCodeInput): Promise<PostMintCodeResponse>;

  getMintTransaction(qrHash: string): Promise<Transaction | null>;
}
