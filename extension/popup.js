const state = document.getElementById('state');
const policy = document.getElementById('policy');
const sync = document.getElementById('sync');
const tokenInput = document.getElementById('token');
const saveToken = document.getElementById('save-token');

function render(rules = {}) {
  policy.replaceChildren();
  Object.entries(rules).forEach(([category, action]) => {
    const row = document.createElement('div');
    row.className = 'row';
    const name = document.createElement('span');
    name.textContent = category.replace('_', ' ');
    const value = document.createElement('strong');
    value.className = 'action';
    value.textContent = typeof action === 'string' ? action : `${action.action}${action.active ? ' / active' : ' / inactive'}`;
    row.append(name, value);
    policy.append(row);
  });
}

chrome.storage.local.get(['sdg_token', 'sdg_policy'], ({ sdg_token, sdg_policy }) => {
  state.textContent = sdg_token ? 'Protected and connected' : 'Not connected. Log in from the dashboard.';
  tokenInput.value = sdg_token || '';
  render(sdg_policy);
});
saveToken.addEventListener('click', () => {
  const token = tokenInput.value.trim();
  if (!token) { state.textContent = 'Paste a login token first'; return; }
  chrome.storage.local.set({ sdg_token: token }, () => { state.textContent = 'Token saved. Sync policy now.'; });
});
sync.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'sync-policy' }, (response) => {
  if (response?.ok) { state.textContent = 'Policy synced'; render(Object.fromEntries(response.policy.map((rule) => [rule.category, rule.action]))); }
  else state.textContent = 'Could not sync policy';
}));
