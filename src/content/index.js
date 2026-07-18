import { scanText } from '../detectors/index';
import { redactText } from '../detectors/redact';
import { initUI, showWarning, hideWarning, showCleanState } from './ui';
import { executeDeepScan } from '../services/scanner';

console.log("🛡️ PromptShield Enterprise Engine Initialized");

let isShieldActive = true;
let activeTarget = null;
let currentThreats = [];

initUI();

// =================================================================
// 1. LIVE CHROME STORAGE SYNCHRONIZATION (+ Instant Rescan)
// =================================================================
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['promptShieldActive'], (result) => {
    if (result.promptShieldActive !== undefined) {
      isShieldActive = result.promptShieldActive;
      if (!isShieldActive) hideWarning();
    }
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.promptShieldActive) {
      isShieldActive = changes.promptShieldActive.newValue;
      
      if (!isShieldActive) {
        hideWarning();
        currentThreats = [];
        console.log("🛡️ PromptShield: Protection Paused");
      } else {
        console.log("🛡️ PromptShield: System Armed");
        // 👉 THE MAGIC FIX: Immediately scan whatever is sitting in the editor right now!
        triggerImmediateScan();
      }
    }
  });
}

// =================================================================
// 2. INSTANT RESCAN ROUTINE (For when extension is turned back ON)
// =================================================================
// =================================================================
// 2. INSTANT RESCAN ROUTINE (For when extension is turned back ON)
// =================================================================
function triggerImmediateScan() {
  const target = activeTarget || 
                 document.activeElement?.closest('textarea, [contenteditable="true"], #prompt-textarea') || 
                 document.querySelector('textarea, [contenteditable="true"], #prompt-textarea');

  if (target) {
    activeTarget = target;
    const text = target.value || target.innerText || '';
    
    if (text.trim()) {
      currentThreats = scanText(text);
      if (currentThreats.length > 0) {
        // 👉 THE FIX: Pass handleDeepScan instead of executeDeepScan
        showWarning(currentThreats, executeSafeRedaction, handleDeepScan);
      } else {
        // 👉 THE FIX: Pass handleDeepScan instead of executeDeepScan
        showCleanState(handleDeepScan);
      }
    } else {
      hideWarning();
    }
  }
}

// =================================================================
// 3. DEBOUNCED SCANNER
// =================================================================
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const runScan = debounce((text) => {
  if (!isShieldActive) return;
  
  if (!text || !text.trim()) {
    hideWarning();
    return;
  }

  currentThreats = scanText(text);
  if (currentThreats.length > 0) {
    // 👉 THE FIX: Pass handleDeepScan instead of executeDeepScan
    showWarning(currentThreats, executeSafeRedaction, handleDeepScan);
  } else {
    // 👉 THE FIX: Pass handleDeepScan instead of executeDeepScan
    showCleanState(handleDeepScan);
  }
}, 200);
// =================================================================
// 4. UNIVERSAL EVENT HANDLER
// =================================================================
function handleInputEvent(event) {
  if (!isShieldActive) return;
  
  const target = event.target.closest('textarea, [contenteditable="true"], #prompt-textarea');
  if (!target) return;

  activeTarget = target;

  if (event.type === 'paste') {
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const existingText = target.value || target.innerText || '';
    runScan(existingText + pastedText);
    return;
  }

  const text = target.value || target.innerText || '';
  runScan(text);
}

// =================================================================
// 5. CURSOR-PRESERVING REDACTION
// =================================================================
function executeSafeRedaction() {
  if (!activeTarget || currentThreats.length === 0 || !isShieldActive) return;

  const isTextarea = activeTarget.tagName.toLowerCase() === 'textarea';
  const originalText = isTextarea ? activeTarget.value : activeTarget.innerText;
  const cleanedText = redactText(originalText, currentThreats);

  if (originalText === cleanedText) return;

  if (isTextarea) {
    const start = activeTarget.selectionStart;
    const lengthDiff = cleanedText.length - originalText.length;
    activeTarget.value = cleanedText;
    const newCursorPos = Math.max(0, start + lengthDiff);
    activeTarget.setSelectionRange(newCursorPos, newCursorPos);
  } else {
    activeTarget.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(activeTarget);
    selection.removeAllRanges();
    selection.addRange(range);

    const success = document.execCommand('insertText', false, cleanedText);
    if (!success) {
      activeTarget.innerText = cleanedText;
    }
  }

  activeTarget.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  activeTarget.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  
  hideWarning();
}


// =================================================================
// 6. PHASE 3: DEEP SCAN HANDLER (Using services/scanner.js)
// =================================================================
async function handleDeepScan() {
  if (!activeTarget || !isShieldActive) return;

  const isTextarea = activeTarget.tagName.toLowerCase() === 'textarea';
  const originalText = isTextarea ? activeTarget.value : activeTarget.innerText;
  if (!originalText.trim()) return;

  try {
    // Calls your existing FastAPI service
    const result = await executeDeepScan(originalText);
    const cleanedText = result.sanitizedText;

    if (originalText === cleanedText) {
      hideWarning();
      return;
    }

    // Insert clean text so ChatGPT/Claude recognize the DOM change
    if (isTextarea) {
      activeTarget.value = cleanedText;
    } else {
      activeTarget.focus();
      document.execCommand('selectAll', false, null);
      const success = document.execCommand('insertText', false, cleanedText);
      if (!success) activeTarget.innerText = cleanedText;
    }

    activeTarget.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    activeTarget.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    hideWarning();
  } catch (err) {
    console.error("Deep Scan execution failed:", err);
    throw err;
  }
}



// =================================================================
// 7. EVENT DELEGATION & SPA OBSERVER
// =================================================================
document.addEventListener('input', handleInputEvent, { capture: true });
document.addEventListener('paste', handleInputEvent, { capture: true });

const spaObserver = new MutationObserver(() => {
  if (!document.getElementById('promptshield-shadow-host')) {
    initUI();
  }
});

spaObserver.observe(document.body, { childList: true, subtree: true });