(() => {
  const flagged = new WeakMap();
  const replaying = new WeakSet();
  const notices = new WeakMap();

  function monitoredElements() {
    return document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"], [role="textbox"]');
  }

  function report(category, decision) {
    chrome.runtime.sendMessage({
      type: 'log-decision',
      domain: window.location.hostname,
      pageUrl: window.location.href,
      pageTitle: document.title,
      field: 'message composer',
      category,
      decision
    });
  }

  function showNotice(element, category, rule) {
    if (notices.get(element) === category) return;
    notices.set(element, category);
    const notice = document.createElement('div');
    notice.textContent = `Sensitive ${category.replace('_', ' ')} detected. Rule: ${rule}.`;
    notice.style.cssText = 'position:fixed;z-index:2147483647;top:20px;right:20px;max-width:320px;padding:14px 18px;background:#153d39;color:#fff;font:600 14px/1.4 Arial,sans-serif;border-left:4px solid #e1aa47;box-shadow:0 8px 24px #0004;border-radius:3px;';
    document.documentElement.append(notice);
    window.setTimeout(() => notice.remove(), 4200);
  }

  function handleInput(event) {
    const element = event.target;
    const value = element.isContentEditable || element.getAttribute('role') === 'textbox' ? element.textContent : element.value;
    const category = checkSensitive(value);
    if (category) {
      flagged.set(element, category);
      element.dataset.sdgFlag = category;
      chrome.storage.local.get(['sdg_policy'], ({ sdg_policy = {} }) => {
        const savedRule = sdg_policy[category];
        const active = typeof savedRule === 'string' || savedRule?.active === true;
        if (active) showNotice(element, category, typeof savedRule === 'string' ? savedRule : savedRule?.action || 'warn');
      });
    } else {
      flagged.delete(element);
      notices.delete(element);
      delete element.dataset.sdgFlag;
    }
  }

  function isSubmitButton(element) {
    if (!(element instanceof HTMLElement)) return false;
    const button = element.closest('button, input[type="submit"], [role="button"]');
    if (!button) return false;
    const label = `${button.getAttribute('aria-label') || ''} ${button.textContent || ''} ${button.getAttribute('type') || ''}`.toLowerCase();
    return /send|submit|post|tweet|publish/.test(label);
  }

  function findFlaggedElement() {
    for (const element of monitoredElements()) if (flagged.has(element)) return element;
    return null;
  }

  document.addEventListener('input', handleInput, true);
  document.addEventListener('click', (event) => {
    const submitButton = event.target.closest?.('button, input[type="submit"], [role="button"]');
    if (replaying.has(submitButton) || !isSubmitButton(event.target)) return;
    const element = findFlaggedElement();
    if (!element) return;

    const category = flagged.get(element);
    chrome.storage.local.get(['sdg_policy'], ({ sdg_policy = {} }) => {
      const savedRule = sdg_policy[category] || { action: 'warn', active: false };
      const action = typeof savedRule === 'string' ? savedRule : savedRule.action;
      if (typeof savedRule !== 'string' && savedRule.active === false) return;
      if (action === 'allow') { report(category, 'allowed'); return; }
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action === 'block') { report(category, 'blocked'); return; }
      const confirmed = window.confirm('Sensitive data detected. Send it anyway?');
      report(category, confirmed ? 'allowed' : 'blocked');
      if (confirmed) {
        replaying.add(submitButton);
        submitButton.click();
        replaying.delete(submitButton);
      }
    });
  }, true);
})();
