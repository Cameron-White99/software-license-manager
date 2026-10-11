import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Alert, PageHeader } from '../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const updated = await api('/api/users/me', { method: 'PUT', body: profile });
      setUser(updated);
      setMessage('Profile saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const result = await api('/api/users/me/password', { method: 'PUT', body: passwords });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader title="User Profile Management" subtitle="Manage enterprise account credentials, administrative identity, and security settings." />
      <div className="profile-wrap">
        <Alert type="success">{message}</Alert>
        <Alert>{error}</Alert>
        <form className="profile-card" onSubmit={saveProfile}>
          <h2>Personal Information</h2>
          <div className="field">
            <label htmlFor="full_name">Full Name</label>
            <input id="full_name" value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit">Save Changes</button>
        </form>
        <form className="profile-card" onSubmit={savePassword}>
          <h2>Security & Password</h2>
          <div className="field">
            <label htmlFor="current">Current Password</label>
            <input id="current" type="password" placeholder="Enter current password" value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="next">New Password</label>
            <input id="next" type="password" placeholder="Enter new password" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} required />
            <p className="hint">Must be at least 8 characters with a mix of letters and numbers.</p>
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm Password</label>
            <input id="confirm" type="password" placeholder="Re-enter new password" value={passwords.confirm_password} onChange={(event) => setPasswords({ ...passwords, confirm_password: event.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit">Update Password</button>
        </form>
      </div>
    </section>
  );
}
