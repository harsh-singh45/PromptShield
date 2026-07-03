import { isValidVerhoeff } from './verhoeff';

export const securityRules = [
  {
    name: "OpenAI API Key",
    type: "Credential",
    // Catches modern sk-proj-, sk-svcacct-, sk-admin-, plus legacy sk- keys
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
    // Initial candidate scan for 12-digit formatted numbers
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    validate: (match) => isValidVerhoeff(match) ? "HIGH" : null
  }
];