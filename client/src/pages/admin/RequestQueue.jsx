import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Message, SearchBox, StatusBadge } from '../../components/ui';
import { formatLongDate } from '../../utils/format';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';

export default function RequestQueue() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load() {
    api('/api/licenses').then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    setError('');
    try {
      await api(`/api/licenses/${id}/status`, { method: 'PATCH', body: { status } });
      setSuccess('Request updated.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this license request?')) return;
    setError('');
    try {
      await api(`/api/licenses/${id}`, { method: 'DELETE' });
      setSuccess('Request deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = items.filter((item) => {
    const haystack = [item.user?.full_name, item.user?.email, item.assigned_software?.software_name].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <Card>
      <Card.Body className="pb-0">
        <h1 className="h4 mb-3">License Requests Queue</h1>
        <Message type="success">{success}</Message>
        <Message>{error}</Message>
        <SearchBox value={query} onChange={setQuery} placeholder="Filter by applicant, email, or software package..." />
      </Card.Body>
      <Table responsive hover className="mb-0 align-middle">
        <thead>
          <tr className="text-secondary small">
            <th>APPLICANT & EMAIL</th>
            <th>SOFTWARE PACKAGE</th>
            <th>VERSION</th>
            <th>REQUEST DATE</th>
            <th>JUSTIFICATION AUDIT</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((item) => (
            <tr key={item._id}>
              <td>
                <div className="fw-semibold">{item.user?.full_name}</div>
                <div className="text-secondary small">{item.user?.email}</div>
              </td>
              <td className="fw-semibold">{item.assigned_software?.software_name}</td>
              <td>{item.version_number?.version_number || '—'}</td>
              <td>{formatLongDate(item.requested_at)}</td>
              <td>{item.reason}</td>
              <td><StatusBadge value={item.status.toUpperCase()} /></td>
              <td className="text-end text-nowrap">
                {item.status === 'Pending' ? (
                  <>
                    <Button variant="outline-primary" size="sm" className="me-2" type="button" onClick={() => setStatus(item._id, 'Approved')}>APPROVE</Button>
                    <Button variant="outline-secondary" size="sm" className="me-2" type="button" onClick={() => setStatus(item._id, 'Rejected')}>REJECT</Button>
                  </>
                ) : null}
                {item.status === 'Approved' ? (
                  <Button variant="outline-secondary" size="sm" className="me-2" type="button" onClick={() => setStatus(item._id, 'Expired')}>REVOKE</Button>
                ) : null}
                <Button variant="outline-danger" size="sm" type="button" onClick={() => remove(item._id)}>DELETE</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {visible.length === 0 ? <p className="text-center text-secondary py-4 mb-0">No requests match your search.</p> : null}
    </Card>
  );
}