import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthLayout } from './Login';

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/auth/signup', form);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create account');
    }
  }

  return <AuthLayout eyebrow="A calmer internet" title="Start your guard" subtitle="Choose what happens when sensitive data meets the open web.">
    <form onSubmit={submit} className="auth-form">
      <label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Password<input type="password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary-button" type="submit">Create account <span>↗</span></button>
      <p className="auth-switch">Already have an account? <Link to="/">Log in</Link></p>
    </form>
  </AuthLayout>;
}
