/**
 * Utilities for manipulating and formatting text strings.
 * Pure functions that do not depend on Angular.
 */


/**
 * Joins a list of strings with commas and adds 'y' or 'e' as appropriate at the end.
 * @param list - List of elements to join.
 * @returns Formatted string
 */
export function formatListWithY(list: string[]): string {
  if (list.length <= 1) return list.join('');
  const last = list[list.length - 1];
  const conj = /^[iI]/.test(last) ? ' e ' : ' y ';
  return `${list.slice(0, -1).join(', ')}${conj}${last}`;
}


/**
 * Capitalize connectors in string.
 */
export function capitalizeWords(value: string): string {
  const connectors = [
    'de',
    'del',
    'la',
    'las',
    'los',
    'y',
    'a',
    'en',
    'el',
    'al',
    'por',
    'para',
    'con',
    'o'
  ];
  if (typeof value != 'string') return value;

  return value
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index !== 0 && connectors.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Trim all string values in an object.
 * @param obj - The object to trim.
 * @returns New object with trimmed string values.
 */
export function trimObjectStrings(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    result[key] =
      typeof value === 'string' && value !== null
        ? value.trim()
        : value;
  }
  return result;
}

/**
 * Pluralize a term.
 * @param singularStr - Singular option to return.
 * @param pluralStr - Plural option to return.
 * @param count - Number to determine whether the return is plural or singular.
 * @returns The singular/plural option depending on the count param.
 */
export function pluralize(singularStr: string, pluralStr: string, count: number): string {
  return count === 1 ? singularStr : pluralStr;
}

/**
 * Sanitize string values.
 * @param string - The string to sanitize.
 * @returns Sanitized string.
 */
export function sanitizeString(strValue: string): string {
  const safeText = strValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return safeText;
}

/**
 * Format file bytes to string by converting data size.
 * @param bytes - Size in bytes.
 * @returns Formatted String.
 */
export function formatFileBytes(bytes: number): string {
  if (bytes === 0 || bytes == null) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
