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
  /**
   * Check the minting status of the mint code.
   *
   * @param qrHash The POAP code for which to get the secret.
   * @throws {MintCodeAlreadyUsedError} Thrown when the POAP code has already been minted.
   * @throws {MintCodeExpiredError} Thrown when the POAP code is expired.
   */
  checkMintCode(qrHash: string): Promise<void>;

  getMintCode(qrHash: string): Promise<GetMintCodeResponse>;

  postMintCode(input: MintCodeInput): Promise<PostMintCodeResponse>;

  getMintTransaction(qrHash: string): Promise<Transaction | null>;
}
