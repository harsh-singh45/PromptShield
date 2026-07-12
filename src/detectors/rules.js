// src/detectors/rules.js
import { isValidVerhoeff } from './verhoeff';

export const securityRules = [
  {
    name: "OpenAI API Key",
    type: "Credential",
    regex: /\bsk-(?:proj-|svcacct-|admin-|none-|org-)?(?:[a-zA-Z0-9_-]{32,}|[a-zA-Z0-9]{32,48})\b/g,
    confidence: "HIGH"
  },
  {
    name: "Email Address",
    type: "PII",
    regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    confidence: "HIGH"
  },
  {
    name: "Indian PAN Card",
    type: "PII",
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    confidence: "HIGH"
  },
  {
    name: "Government Identity Number",
    type: "PII",
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    validate: (match) => isValidVerhoeff(match) ? "HIGH" : null
  },
  // --- NEW: FAST PROMPT INJECTION CATCHERS ---
  {
    name: "System Prompt Override",
    type: "Injection",
    regex: /\b(?:ignore|disregard|forget)\s+(?:all\s+)?(?:previous|above|prior)\s+(?:instructions|prompts|rules)\b/gi,
    confidence: "HIGH"
  },
  {
    name: "Jailbreak Roleplay",
    type: "Injection",
    regex: /\b(?:you are now|act as|enable)\s+(?:DAN|developer mode|unfiltered mode|jailbreak)\b/gi,
    confidence: "HIGH"
  }
];