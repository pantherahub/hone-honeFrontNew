import { REGEX_PATTERNS } from "../constants/regex-patterns";

export function isNumeric(value: string): boolean {
  return REGEX_PATTERNS.number.test(value);
}

export function isAlphanumeric(value: string): boolean {
  return REGEX_PATTERNS.alphanumeric.test(value);
}

export function isAlphanumericWithSpaces(value: string): boolean {
  return REGEX_PATTERNS.alphanumericWithSpaces.test(value);
}

export function isEmail(value: string): boolean {
  return REGEX_PATTERNS.email.test(value);
}

export function isUrl(value: string): boolean {
  return REGEX_PATTERNS.url.test(value);
}

export function isTelephoneNumber(value: string): boolean {
  return REGEX_PATTERNS.telephoneNumber.test(value);
}
