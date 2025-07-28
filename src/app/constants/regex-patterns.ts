export const REGEX_PATTERNS = {
  number: /^[0-9]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9 ]+$/,
  url: /^(?![\w.+-]+@[\w-]+\.[\w.-]+$)(https?:\/\/)?((localhost)|((\d{1,3}\.){3}\d{1,3})|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?(#\S*)?$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  telephoneNumber: /^[0-9#]*$/,
  telNumberWithIndicative: /^\+?\d*$/,
};
