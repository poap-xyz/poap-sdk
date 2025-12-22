const ETHEREUM_ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i;

export function isValidEthereumAddressFormat(address: string): boolean {
  return ETHEREUM_ADDRESS_REGEX.test(address);
}
