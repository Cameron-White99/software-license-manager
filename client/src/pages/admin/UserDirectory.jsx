import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Alert, PageHeader, SearchBox, StatusBadge } from '../../components/ui';

const empty = { full_name: '', email: '', role: 'user', status: 'active' };

export default function UserDirectory() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load() {
    api('/api/users').then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(user) {
    const status = user.status === 'blocked' ? 'active' : 'blocked';
    const verb = status === 'blocked' ? 'Block' : 'Unblock';
    if (!window.confirm(`${verb} ${user.full_name}?`)) return;
    setError('');
    try {
      await api(`/api/users/${user._id}/status`, { method: 'PATCH', body: { status } });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(user) {
    if (!window.confirm(`Delete ${user.full_name}?`)) return;
    setError('');
    try {
      await api(`/api/users/${user._id}`, { method: 'DELETE' });
      setSuccess('User deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = items.filter((user) => `${user.full_name} ${user.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section>
      <PageHeader title="User Accounts Directory" action={<button className="btn btn-primary" type="button" onClick="">Add New User</button>} />
      <Alert type="success">{success}</Alert>
      <Alert>{error}</Alert>
      <SearchBox value={query} onChange={setQuery} placeholder="Search users by name, email, or identifier..." />
      <div className="data-card">
        <table>
          <thead>
            <tr>
              <th>FULL NAME</th>
              <th>EMAIL ADDRESS</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((user) => (
              <tr key={user._id}>
                <td className="strong">{user.full_name}</td>
                <td className="secondary">{user.email}</td>
                <td className="strong">{user.role === 'admin' ? 'Admin' : 'User'}</td>
                <td><StatusBadge value={user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'} /></td>
                <td>
                  <div className="actions">
                    <button className="btn btn-muted btn-sm" type="button" onClick="">Edit</button>
                    <button className={`btn btn-sm ${user.status === 'blocked' ? 'btn-ok' : 'btn-warn'}`} type="button" onClick={() => toggleStatus(user)}>
                      {user.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => remove(user)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 ? <p className="empty">No users match your search.</p> : null}
      </div>
    </section>
  );
}
