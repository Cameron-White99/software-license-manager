import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Message, SearchBox } from '../../components/ui';
import { formatDate } from '../../utils/format';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';

export default function SoftwareInventory() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    api('/api/software').then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setMode('add');
    setSelected(null);
    setName('');
    setError('');
  }

  function openEdit(item) {
    setMode('edit');
    setSelected(item);
    setName(item.software_name);
    setError('');
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'add') await api('/api/software', { method: 'POST', body: { software_name: name } });
      else await api(`/api/software/${selected._id}`, { method: 'PUT', body: { software_name: name } });
      setSuccess(mode === 'add' ? 'Software added.' : 'Software updated.');
      setMode(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.software_name}?`)) return;
    setError('');
    try {
      await api(`/api/software/${item._id}`, { method: 'DELETE' });
      setSuccess('Software removed.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = items.filter((item) => item.software_name.toLowerCase().includes(query.toLowerCase()));

  if (mode) {
    return (
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body className="p-4">
              <Stack direction="horizontal" className="justify-content-between mb-3">
                <h2 className="h4 mb-0">{mode === 'add' ? 'Add New Software' : 'Edit Software'}</h2>
              </Stack>
              <Form onSubmit={save}>
                <Message>{error}</Message>
                <Form.Group className="mb-3" controlId="software_name">
                  <Form.Label>Software Name {mode === 'add' ? <span className="text-danger">*</span> : null}</Form.Label>
                  <Form.Control placeholder="e.g. CodeSphere Studio Enterprise" value={name} onChange={(event) => setName(event.target.value)} required />
                </Form.Group>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" type="button" onClick={() => setMode(null)}>Cancel</Button>
                  <Button type="submit" disabled={busy}>{mode === 'add' ? 'Save Software' : 'Save Changes'}</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Card>
      <Card.Body className="pb-0">
        <Stack direction="horizontal" className="justify-content-between mb-3 flex-wrap" gap={2}>
          <h1 className="h4 mb-0">Software License Inventory</h1>
          <Button size="sm" type="button" onClick={openAdd}>+ ADD NEW SOFTWARE</Button>
        </Stack>
        <Message type="success">{success}</Message>
        <Message>{error}</Message>
        <SearchBox value={query} onChange={setQuery} placeholder="Filter by package name, SKU, or publisher..." />
      </Card.Body>
      <Table responsive hover className="mb-0 align-middle">
        <thead>
          <tr className="text-secondary small">
            <th>REF #</th>
            <th>SOFTWARE NAME</th>
            <th>CREATED DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((item) => (
            <tr key={item._id}>
              <td>{String(items.indexOf(item) + 1).padStart(3, '0')}</td>
              <td className="fw-semibold">{item.software_name}</td>
              <td>{formatDate(item.created_at)}</td>
              <td className="text-end text-nowrap">
                <Button as={Link} to={`/admin/software/${item._id}`} variant="outline-primary" size="sm" className="me-2">View</Button>
                <Button variant="outline-secondary" size="sm" className="me-2" type="button" onClick={() => openEdit(item)}>EDIT</Button>
                <Button variant="outline-danger" size="sm" type="button" onClick={() => remove(item)}>DELETE</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {visible.length === 0 ? <p className="text-center text-secondary py-4 mb-0">No software matches your search.</p> : null}
    </Card>
  );
}