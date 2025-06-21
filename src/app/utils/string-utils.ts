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
