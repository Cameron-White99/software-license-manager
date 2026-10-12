import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Alert, PageHeader, SearchBox, StatusBadge } from '../../components/ui';

const empty = { full_name: '', email: '', role: 'user', status: 'active' };

export default function UserDirectory() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    api('/api/users').then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setMode('add');
    setForm(empty);
    setError('');
  }

  function openEdit(user) {
    setMode('edit');
    setSelected(user);
    setForm({ full_name: user.full_name, email: user.email, role: user.role, status: user.status });
    setError('');
  }

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'add') await api('/api/users', { method: 'POST', body: form });
      else await api(`/api/users/${selected._id}`, { method: 'PUT', body: form });
      setSuccess(mode === 'add' ? 'User created. Temporary password is Password123.' : 'User updated.');
      setMode(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

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

  if (mode) {
    return (
      <div className="center-wrap">
        <form className="panel wide" onSubmit={save}>
          <div className="panel-head">
            <h2>{mode === 'add' ? 'Add New User' : 'Edit User'}</h2>
            <button className="icon-btn" type="button" onClick={() => setMode(null)} aria-label="Close">×</button>
          </div>
          <Alert>{error}</Alert>
          <div className="field">
            <label htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" placeholder="e.g. John Doe" value={form.full_name} onChange={update} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="name@company.com" value={form.email} onChange={update} required />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={form.role} onChange={update}>
                <option value="user">USER</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={update}>
                <option value="active">ACTIVE</option>
                <option value="blocked">BLOCKED</option>
              </select>
            </div>
          </div>
          {mode === 'add' ? <p className="hint">New users sign in with the temporary password Password123.</p> : null}
          <div className="form-actions">
            <button className="btn btn-muted" type="button" onClick={() => setMode(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={busy}>{mode === 'add' ? 'Save User' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <section>
      <PageHeader title="User Accounts Directory" action={<button className="btn btn-primary" type="button" onClick={openAdd}>Add New User</button>} />
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
                    <button className="btn btn-muted btn-sm" type="button" onClick={() => openEdit(user)}>Edit</button>
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
