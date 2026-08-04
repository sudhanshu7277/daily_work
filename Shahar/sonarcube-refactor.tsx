const WHITESPACE_OR_HYPHEN = /[\s-]+/g;
const UNDERSCORE = /_/g;
const WORD_BOUNDARY = /\b\w/g;

const normalizeStatusCode = (value: string | null | undefined): string =>
  (value ?? '')
    .trim()
    .toUpperCase()
    .replace(WHITESPACE_OR_HYPHEN, '_');

const statusCodeToLabel = (code: string | null | undefined): string =>
  normalizeStatusCode(code)
    .toLowerCase()
    .replace(UNDERSCORE, ' ')
    .replace(WORD_BOUNDARY, (char) => char.toUpperCase());


    