import { MintCodeInput } from './types/MintCodeInput';
import {
  GetMintCodeResponse,
  PostMintCodeResponse,
} from './types/MintCodeResponse';
import { Transaction } from './types/Transaction';

/**
 * Provides methods for interacting with a Tokens API.
 */
export interface TokensApiProvider {
  getMintCode(qrHash: string): Promise<GetMintCodeResponse>;

  postMintCode(input: MintCodeInput): Promise<PostMintCodeResponse>;

  getMintTransaction(qrHash: string): Promise<Transaction | null>;
}
