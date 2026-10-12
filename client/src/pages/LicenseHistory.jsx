import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import { Message, PageHeader, SearchBox, StatusBadge } from '../components/ui';
import { formatDate } from '../utils/format';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';

const labels = { Approved: 'Active', Pending: 'Pending', Rejected: 'Rejected', Expired: 'Expired' };

export default function LicenseHistory() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');

  function load() {
    api('/api/licenses/mine').then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!window.confirm('Cancel this subscription?')) return;
    setError('');
    try {
      await api(`/api/licenses/${id}/cancel`, { method: 'PATCH' });
      setSuccess('Subscription cancelled.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = items.filter((item) => {
    const haystack = [
      item.assigned_software?.software_name,
      item.version_number?.version_number,
      labels[item.status],
    ].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <section>
      <PageHeader title="My Software License History" />
      <Message type="success">{success}</Message>
      <Message>{error}</Message>
      <Card>
        <Card.Body className="pb-0">
          <SearchBox label="SEARCH:" value={query} onChange={setQuery} placeholder="Search by product, version, or status..." />
        </Card.Body>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr className="text-secondary small">
              <th>SOFTWARE NAME</th>
              <th>VERSION</th>
              <th>REQUESTED</th>
              <th>REVIEWED</th>
              <th>EXPIRES AT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              const label = labels[item.status] || item.status;
              const version = item.version_number?.version_number;
              const feedbackTo = item.version_number
                ? `/feedback/new?version=${item.version_number._id}&name=${encodeURIComponent(`${item.assigned_software?.software_name || ''} ${version}`)}`
                : '';
              return (
                <tr key={item._id}>
                  <td className="fw-semibold">{item.assigned_software?.software_name}</td>
                  <td>{version || '—'}</td>
                  <td>{formatDate(item.requested_at)}</td>
                  <td>{item.status === 'Pending' ? 'Pending Review' : formatDate(item.reviewed_at)}</td>
                  <td>{item.status === 'Pending' || item.status === 'Rejected' ? '—' : formatDate(item.expires_at)}</td>
                  <td><StatusBadge value={label} /></td>
                  <td className="text-end text-nowrap">
                    {item.status === 'Approved' ? (
                      <Button variant="outline-danger" size="sm" className="me-2" type="button" onClick={() => cancel(item._id)}>Cancel Subscription</Button>
                    ) : null}
                    {feedbackTo && item.status !== 'Pending' ? (
                      <Button as={Link} to={feedbackTo} variant="outline-primary" size="sm">Give Feedback</Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {visible.length === 0 ? <p className="text-center text-secondary py-4 mb-0">No licenses match your search.</p> : null}
      </Card>
    </section>
  );
}