const ENS_REGEX = /^[^:\/\\\s%@#\(\)\[\]\{\}]+\.[a-z]{2,}$/i;

export function isValidEnsFormat(name: string): boolean {
  return ENS_REGEX.test(name);
}
