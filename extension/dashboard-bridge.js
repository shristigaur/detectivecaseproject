chrome.runtime.sendMessage({
  type: 'dashboard-token',
  token: window.localStorage.getItem('sdg_token')
});