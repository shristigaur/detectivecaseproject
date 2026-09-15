const API_URL = 'http://localhost:5000/api';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'dashboard-token') {
    if (typeof message.token === 'string' && message.token) {
      chrome.storage.local.set({ sdg_token: message.token }, () => sendResponse({ ok: true }));
    } else {
      chrome.storage.local.remove(['sdg_token', 'sdg_policy'], () => sendResponse({ ok: true }));
    }
    return true;
  }

  if (message.type === 'log-decision') {
    chrome.storage.local.get(['sdg_token'], ({ sdg_token }) => {
      if (!sdg_token) return sendResponse({ ok: false });
      const saveLog = (imageData) => fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sdg_token}` },
        body: JSON.stringify({ domain: message.domain, pageUrl: message.pageUrl, pageTitle: message.pageTitle, field: message.field, category: message.category, decision: message.decision, imageData })
      }).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
      if (sender.tab?.windowId === undefined) return saveLog();
      chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'jpeg', quality: 55 }, (imageData) => {
        if (chrome.runtime.lastError || !imageData) return saveLog();
        saveLog(imageData);
      });
    });
    return true;
  }

  if (message.type === 'sync-policy') {
    chrome.storage.local.get(['sdg_token'], ({ sdg_token }) => {
      if (!sdg_token) return sendResponse({ ok: false });
      fetch(`${API_URL}/policy`, { headers: { Authorization: `Bearer ${sdg_token}` } })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('Policy request failed')))
        .then((policy) => chrome.storage.local.set({ sdg_policy: Object.fromEntries(policy.map((rule) => [rule.category, { action: rule.action, active: rule.active !== false }])) }, () => sendResponse({ ok: true, policy })))
        .catch(() => sendResponse({ ok: false }));
    });
    return true;
  }
});
