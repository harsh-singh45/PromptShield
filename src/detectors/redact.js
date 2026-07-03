/**
 * Performs single-pass string reconstruction using known token coordinates.
 * Algorithmic complexity: O(N log N) for sorting coordinates, O(N) for string reconstruction.
 */
export function redactText(originalText, detectedThreats) {
  if (!detectedThreats || detectedThreats.length === 0) return originalText;

  // 1. Sort threats from right to left (highest startIndex first)
  const sortedThreats = [...detectedThreats].sort((a, b) => b.startIndex - a.startIndex);

  let result = originalText;

  // 2. Splicing from right to left guarantees earlier coordinates remain 100% accurate
  for (const threat of sortedThreats) {
    const prefix = result.slice(0, threat.startIndex);
    const suffix = result.slice(threat.endIndex);
    const placeholder = `[REDACTED_${threat.type.toUpperCase()}]`;

    result = `${prefix}${placeholder}${suffix}`;
  }

  return result;
}