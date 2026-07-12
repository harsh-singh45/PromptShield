// src/services/scanner.js
import { processPrompt as runLocalFastScan } from '../detectors/index';

const BACKEND_API_URL = "http://localhost:8000/api/v1/deep-scan";
const HEALTH_CHECK_URL = "http://localhost:8000/health";

/**
 * Checks if the FastAPI Presidio backend is online and reachable.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(HEALTH_CHECK_URL, { method: "GET", cache: "no-store" });
    return res.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Executes Tier 1: Local Regex & Checksum Scan (< 5ms, 0 network latency).
 */
export function executeFastScan(text) {
  const result = runLocalFastScan(text);
  return {
    ...result,
    engineMode: "FAST_REGEX",
    timestamp: Date.now()
  };
}

/**
 * Executes Tier 2: Remote Presidio NLP Scan (~150-300ms).
 * Includes automatic fallback to Fast Scan if the server is offline.
 */
export async function executeDeepScan(text, options = { threshold: 0.60, mode: "replace" }) {
  if (!text || !text.trim()) {
    return executeFastScan(text);
  }

  try {
    const response = await fetch(BACKEND_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        language: "en",
        score_threshold: options.threshold,
        anonymize_mode: options.mode
      })
    });

    if (!response.ok) {
      throw new Error(`Backend returned HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Map backend snake_case response to frontend camelCase convention
    return {
      isClean: data.is_clean,
      threatCount: data.threat_count,
      originalText: data.original_text,
      sanitizedText: data.sanitized_text,
      threats: data.threats.map(t => ({
        id: `${t.entity_type}-${t.start}`,
        name: t.entity_type,
        type: t.entity_type.includes("INJECTION") ? "Injection" : "PII",
        value: t.snippet,
        startIndex: t.start,
        endIndex: t.end,
        confidence: `${Math.round(t.score * 100)}%`
      })),
      engineMode: "DEEP_PRESIDIO",
      timestamp: Date.now()
    };
  } catch (error) {
    console.warn("⚠️ Deep Scan unavailable. Degrading gracefully to Local Fast Scan:", error.message);
    // Automatic Fallback
    const localResult = executeFastScan(text);
    return {
      ...localResult,
      engineMode: "FAST_REGEX_FALLBACK",
      fallbackReason: error.message
    };
  }
}