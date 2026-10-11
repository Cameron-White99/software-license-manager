import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { Message, PageHeader, SearchBox } from '../../components/ui';
import { formatDate } from '../../utils/format';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';

export default function VersionList() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');

  function load() {
    api('/api/versions').then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, []);

  async function remove(item) {
    if (!window.confirm(`Delete ${item.version_number}?`)) return;
    setError('');
    try {
      await api(`/api/versions/${item._id}`, { method: 'DELETE' });
      setSuccess('Version deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = items.filter((item) => {
    const haystack = [item.software?.software_name, item.version_number, item.release_notes].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <section>
      <PageHeader title="Published Versions" action={<Button as={Link} to="/admin/versions/new">+ Add Version</Button>} />
      <Message type="success">{success}</Message>
      <Message>{error}</Message>
      <Card>
        <Card.Body className="pb-0">
          <SearchBox label="SEARCH:" value={query} onChange={setQuery} placeholder="Search by software name, version, or release notes..." />
        </Card.Body>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr className="text-secondary small">
              <th>SOFTWARE NAME</th>
              <th>VERSION</th>
              <th>RELEASE DATE</th>
              <th>RELEASE NOTES</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item._id}>
                <td className="fw-semibold">{item.software?.software_name}</td>
                <td>{item.version_number}</td>
                <td>{formatDate(item.release_date)}</td>
                <td>{item.release_notes}</td>
                <td className="text-end">
                  <Button variant="outline-danger" size="sm" type="button" onClick={() => remove(item)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {visible.length === 0 ? <p className="text-center text-secondary py-4 mb-0">No versions match your search.</p> : null}
      </Card>
    </section>
  );
}