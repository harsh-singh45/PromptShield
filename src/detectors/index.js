import { securityRules } from './rules';

/**
 * Executes a stateless, immutable scan returning precise token coordinates.
 */
export function scanText(text) {
  if (!text || typeof text !== 'string') return [];

  const detectedThreats = [];

  for (const rule of securityRules) {
    // String.prototype.matchAll is stateless and immune to lastIndex mutation bugs
    const matches = [...text.matchAll(rule.regex)];

    for (const match of matches) {
      const value = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + value.length;
      
      // Execute algorithmic validation (e.g., Verhoeff) if defined on the rule
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

  return detectedThreats;
}