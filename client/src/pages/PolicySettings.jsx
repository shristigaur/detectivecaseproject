import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

const categories = [
  ['email', 'Email addresses', 'Personal inboxes and contact details'],
  ['phone_number', 'Phone numbers', 'Direct lines and mobile numbers'],
  ['card_number', 'Card numbers', 'Payment details and account numbers'],
  ['address', 'Postal addresses', 'Home and delivery locations'],
  ['id_document', 'ID documents', 'Government and identity references']
];
const actions = ['allow', 'warn', 'block'];

export default function PolicySettings() {
  const [rules, setRules] = useState({});
  const [error, setError] = useState('');
  useEffect(() => { api.get('/policy').then(({ data }) => setRules(Object.fromEntries(data.map((rule) => [rule.category, { action: rule.action, active: rule.active === true }])))).catch(() => setError('Could not load policy')); }, []);

  async function update(category, action) {
    const previous = rules[category] || { action: 'warn', active: false };
    const next = { action, active: previous.active };
    setRules({ ...rules, [category]: next });
    try { await api.post('/policy', { category, action, active: next.active }); } catch { setRules({ ...rules, [category]: previous }); setError('Could not save policy'); }
  }

  async function activate(category) {
    const previous = rules[category] || { action: 'warn', active: false };
    const next = { ...previous, active: true };
    setRules({ ...rules, [category]: next });
    try { await api.post('/policy', { category, action: next.action, active: true }); } catch { setRules({ ...rules, [category]: previous }); setError('Could not activate rule'); }
  }

  return <DashboardLayout title="Policy settings" kicker="YOUR GUARD / 01"><p className="intro">Choose a response, then activate the rule. Detection happens locally in your browser.</p>{error && <p className="error">{error}</p>}<div className="policy-list">{categories.map(([category, label, description]) => { const rule = rules[category] || { action: 'warn', active: false }; return <article className="policy-row" key={category}><div><h2>{label}</h2><p>{description}</p></div><div style={{ display: 'grid', gap: 9, minWidth: 300 }}><div className="segmented">{actions.map((action) => <button className={rule.action === action ? `selected ${action}` : ''} onClick={() => update(category, action)} key={action}>{action}</button>)}</div><button style={{ border: '1px solid #153d39', background: rule.active ? '#37715c' : 'transparent', color: rule.active ? '#fff' : '#153d39', padding: '8px 11px', cursor: 'pointer', fontSize: '.78rem', fontWeight: 700 }} onClick={() => activate(category)}>{rule.active ? 'Rule active' : 'Activate rule'}</button></div></article>; })}</div></DashboardLayout>;
}

export function DashboardLayout({ title, kicker, children }) {
  return <main className="dashboard-shell"><nav className="topbar"><a className="brand" href="/policy">SDG<span>.</span></a><div className="nav-links"><a href="/policy">Policy</a><a href="/activity">Activity</a><button onClick={() => { localStorage.removeItem('sdg_token'); window.location.href = '/'; }}>Sign out</button></div></nav><section className="dashboard-content"><p className="eyebrow">{kicker}</p><h1>{title}</h1>{children}</section></main>;
}
