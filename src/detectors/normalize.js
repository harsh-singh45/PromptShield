// src/detectors/normalize.js

const HOMOGLYPH_MAP = {
  'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'y': 'y',
  'А': 'A', 'С': 'C', 'Е': 'E', 'О': 'O', 'Р': 'P', 'Х': 'X'
};

/**
 * Strips zero-width bypass tokens and converts homoglyphs to pure ASCII.
 */
export function normalizeInput(text) {
  if (!text || typeof text !== 'string') return "";
  
  // 1. Strip zero-width spaces, joiners, and bidirectional formatting overrides
  let cleaned = text.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, "");
  
  // 2. Normalize Unicode forms (unifies multi-byte characters)
  cleaned = cleaned.normalize("NFKC");
  
  // 3. Remap lookalike characters back to standard Latin
  return cleaned.replace(/[асeорхуАСЕОРХ]/g, char => HOMOGLYPH_MAP[char] || char);
}