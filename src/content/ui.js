let shadowRoot = null;
let warningContainer = null;

export function initUI() {
  if (shadowRoot) return;

  // 1. Create host container
  const host = document.createElement('div');
  host.id = 'promptshield-shadow-host';
  host.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2147483647;';
  document.body.appendChild(host);

  // 2. Attach isolated Shadow DOM
  shadowRoot = host.attachShadow({ mode: 'open' });

  // 3. Inject internal CSS safely
  const style = document.createElement('style');
  style.textContent = `
    .shield-box {
      background: #18181b; color: #f4f4f5; width: 300px; padding: 16px;
      border-radius: 12px; border: 1px solid #ef4444; font-family: system-ui, sans-serif;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); display: none; flex-direction: column; gap: 12px;
    }
    .header { display: flex; align-items: center; gap: 8px; color: #ef4444; font-weight: 700; font-size: 14px; }
    .threat-list { display: flex; flex-direction: column; gap: 6px; max-height: 150px; overflow-y: auto; }
    .threat-item { background: #27272a; padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between; font-size: 12px; }
    .btn-redact { background: #ef4444; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; }
    .btn-redact:hover { background: #dc2626; }
    .btn-deep { background: #2563eb; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 6px; }
    .btn-deep:hover { background: #1d4ed8; }
  `;
  shadowRoot.appendChild(style);

  // 4. Build warning container without innerHTML
  warningContainer = document.createElement('div');
  warningContainer.className = 'shield-box';
  shadowRoot.appendChild(warningContainer);
}

export function hideWarning() {
  if (warningContainer) warningContainer.style.display = 'none';
}

export function showWarning(threats, onRedact, onDeepScan) {
  if (!warningContainer) initUI();

  // Clear previous DOM nodes
  while (warningContainer.firstChild) {
    warningContainer.removeChild(warningContainer.firstChild);
  }

  // Header
  const header = document.createElement('div');
  header.className = 'header';
  header.textContent = '⚠ Sensitive Data Detected';
  warningContainer.appendChild(header);

  // Subtext
  const subtext = document.createElement('div');
  subtext.style.fontSize = '12px';
  subtext.style.color = '#a1a1aa';
  subtext.textContent = `Found ${threats.length} potential security risk(s) in prompt.`;
  warningContainer.appendChild(subtext);

  // Threat List
  const list = document.createElement('div');
  list.className = 'threat-list';
  threats.forEach(t => {
    const item = document.createElement('div');
    item.className = 'threat-item';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = t.name;
    
    const confSpan = document.createElement('span');
    confSpan.style.color = '#ef4444';
    confSpan.textContent = `[${t.confidence}]`;
    
    item.appendChild(nameSpan);
    item.appendChild(confSpan);
    list.appendChild(item);
  });
  warningContainer.appendChild(list);

  // 1. Existing Fast Auto-Redact Button
  const btn = document.createElement('button');
  btn.className = 'btn-redact';
  btn.textContent = '🛡️ Auto-Redact Threats';
  btn.onclick = () => {
    onRedact();
    hideWarning();
  };
  warningContainer.appendChild(btn);

  // 2. 👉 ADDED: Deep Scan Button (Only renders if passed from index.js)
  if (onDeepScan) {
    const btnDeep = document.createElement('button');
    btnDeep.className = 'btn-deep';
    btnDeep.textContent = '🔬 Deep Scan (Presidio NLP)';
    btnDeep.onclick = async () => {
      btnDeep.textContent = 'Scanning Backend...';
      btnDeep.disabled = true;
      btn.disabled = true;
      await onDeepScan();
    };
    warningContainer.appendChild(btnDeep);
  }

  warningContainer.style.display = 'flex';
}