// src/detectors/redact.js

/**
 * Replaces detected threat spans with safe placeholder tags.
 * Operates right-to-left to ensure startIndex/endIndex coordinates never drift.
 * 
 * @param {string} text - The original prompt text
 * @param {Array} threats - Array of threat objects from scanText()
 * @returns {string} - The sanitized string
 */
export function redactText(text, threats = []) {
  if (!text || typeof text !== 'string' || threats.length === 0) {
    return text;
  }

  // Clone and sort descending by startIndex (right-to-left processing)
  const sortedThreats = [...threats].sort((a, b) => b.startIndex - a.startIndex);
  
  let sanitized = text;

  for (const threat of sortedThreats) {
    const placeholder = `[REDACTED-${threat.type.toUpperCase()}]`;
    sanitized = 
      sanitized.slice(0, threat.startIndex) + 
      placeholder + 
      sanitized.slice(threat.endIndex);
  }

  return sanitized;
}