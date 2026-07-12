// src/detectors/index.js
import { securityRules } from './rules';
import { normalizeInput } from './normalize';
import { redactText } from './redact';

/**
 * Executes a stateless, immutable scan returning precise token coordinates.
 */
export function scanText(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  // 1. Sanitize invisible characters and homoglyphs first
  const text = normalizeInput(rawText);
  const detectedThreats = [];

  for (const rule of securityRules) {
    const matches = [...text.matchAll(rule.regex)];

    for (const match of matches) {
      const value = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + value.length;
      
      const confidence = rule.validate ? rule.validate(value) : rule.confidence;

      if (confidence) {
        detectedThreats.push({
          id: `${rule.name}-${startIndex}`,
          name: rule.name,
          type: rule.type,
          value,
          startIndex,
          endIndex,
          confidence
        });
      }
    }
  }

  // Sort ascending by startIndex for clean UI presentation
  return detectedThreats.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Unified frontend execution: scans and redacts in one pass (< 5ms).
 */
export function processPrompt(rawText) {
  const normalizedText = normalizeInput(rawText);
  const threats = scanText(normalizedText);
  const sanitizedText = redactText(normalizedText, threats);

  return {
    isClean: threats.length === 0,
    threatCount: threats.length,
    originalText: rawText,
    normalizedText,
    sanitizedText,
    threats
  };
}