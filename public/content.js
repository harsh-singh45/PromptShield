// ==========================================
// 1. STATE MANAGEMENT (Sync with React Dashboard)
// ==========================================
let isShieldActive = true;
let currentInputTarget = null;
let activeThreats = [];

if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['promptShieldActive'], (result) => {
        if (result.promptShieldActive !== undefined) isShieldActive = result.promptShieldActive;
    });
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.promptShieldActive) {
            isShieldActive = changes.promptShieldActive.newValue;
            if (!isShieldActive) hideWarning();
        }
    });
}

// ==========================================
// 2. THREAT DETECTION RULES
// ==========================================
const threatRules = [
    { name: "Email Address", type: "PII", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { name: "OpenAI API Key", type: "Credential", regex: /sk-[a-zA-Z0-9]{32,48}/g },
    { name: "Phone Number", type: "PII", regex: /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g },
    { name: "AWS Access Key", type: "Credential", regex: /AKIA[0-9A-Z]{16}/g }
];

// ==========================================
// 3. SMART WARNING UI & AUTO-REDACT
// ==========================================
const warningBox = document.createElement('div');
warningBox.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #1a1d24; color: white;
    padding: 16px; border-radius: 12px; z-index: 2147483647; font-family: system-ui, -apple-system, sans-serif;
    border: 1px solid #ef4444; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
    display: none; flex-direction: column; gap: 12px; min-width: 280px; transition: all 0.3s ease;
`;
document.body.appendChild(warningBox);

function hideWarning() {
    warningBox.style.display = 'none';
}

function showWarning(threats) {
    if (!isShieldActive) return;

    const threatListHtml = threats.map(t => 
        `<div style="display: flex; justify-content: space-between; font-size: 13px; background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: 6px;">
            <span>${t.name}</span>
            <span style="color: #94a3b8; font-size: 11px;">${t.type}</span>
        </div>`
    ).join('');

    warningBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #ef4444; font-weight: bold; font-size: 14px;">
            ⚠ Sensitive Data Detected
        </div>
        <div style="font-size: 12px; color: #94a3b8;">
            We strongly recommend redacting this data.
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            ${threatListHtml}
        </div>
        <button id="promptshield-redact-btn" style="
            background: #ef4444; color: white; border: none; padding: 8px; 
            border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 4px;
            transition: background 0.2s;">
            🛡️ Auto-Redact Threats
        </button>
    `;
    warningBox.style.display = 'flex';

    // Attach redaction logic to the button
    document.getElementById('promptshield-redact-btn').addEventListener('click', performRedaction);
}

function performRedaction() {
    if (!currentInputTarget) return;

    let newText = currentInputTarget.value || currentInputTarget.innerText;

    // Replace threats with [REDACTED]
    threatRules.forEach(rule => {
        if (activeThreats.some(t => t.name === rule.name)) {
            newText = newText.replace(rule.regex, `[REDACTED_${rule.type.toUpperCase()}]`);
        }
    });

    // Inject cleaned text back into ChatGPT
    if (currentInputTarget.value !== undefined) {
        currentInputTarget.value = newText;
    } else {
        currentInputTarget.innerText = newText;
    }

    // Force React to recognize the change so ChatGPT doesn't ignore it
    currentInputTarget.dispatchEvent(new Event('input', { bubbles: true }));
    hideWarning();
}

// ==========================================
// 4. BULLETPROOF INTERCEPTOR (Typing + Pasting)
// ==========================================

// We moved the scanning logic into a reusable function
function scanTextForThreats(editorContainer) {
    currentInputTarget = editorContainer;
    const text = editorContainer.value || editorContainer.innerText;
    
    if (!text || !text.trim()) {
        hideWarning();
        return;
    }

    activeThreats = [];
    
    threatRules.forEach(rule => {
        rule.regex.lastIndex = 0; 
        if (rule.regex.test(text)) {
            if (!activeThreats.some(t => t.name === rule.name)) {
                activeThreats.push({ name: rule.name, type: rule.type });
            }
        }
    });

    if (activeThreats.length > 0) {
        showWarning(activeThreats);
    } else {
        hideWarning();
    }
}

// Handler for both typing and pasting
function handleUserAction(event) {
    if (!isShieldActive) return;

    const target = event.target;
    const editorContainer = target.closest('textarea, [contenteditable="true"]');

    if (editorContainer) {
        // If it's a paste event, we wait 50ms for the DOM to update before scanning
        if (event.type === 'paste') {
            setTimeout(() => {
                scanTextForThreats(editorContainer);
            }, 50);
        } else {
            // If it's normal typing, scan immediately
            scanTextForThreats(editorContainer);
        }
    }
}

// Listen for both typing AND pasting!
document.addEventListener('input', handleUserAction, { capture: true });
document.addEventListener('paste', handleUserAction, { capture: true });