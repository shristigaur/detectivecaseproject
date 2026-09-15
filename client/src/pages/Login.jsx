import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('sdg_token', data.token);
      navigate('/policy');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in');
    }
  }

  return <AuthLayout eyebrow="Private by design" title="Welcome back" subtitle="Keep sensitive details from leaving the places you trust.">
    <form onSubmit={submit} className="auth-form">
      <label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Password<input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary-button" type="submit">Log in <span>↗</span></button>
      <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
    </form>
  </AuthLayout>;
}

export function AuthLayout({ eyebrow, title, subtitle, children }) {
  return <main className="auth-shell"><section className="auth-aside"><div className="mark">SDG<span>.</span></div><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{subtitle}</p></div><p className="aside-foot">Local detection. Quiet protection.</p></section><section className="auth-panel">{children}</section></main>;
}
