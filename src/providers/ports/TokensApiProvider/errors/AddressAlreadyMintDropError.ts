export class AddressAlreadyMintDropError extends Error {
  constructor(address: string) {
    super(`Address '${address}' already mint drop`);
  }
}
