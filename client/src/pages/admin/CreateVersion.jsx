import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Message } from '../../components/ui';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

export default function CreateVersion() {
  const navigate = useNavigate();
  const [software, setSoftware] = useState([]);
  const [form, setForm] = useState({ software: '', version_number: '', release_date: '', release_notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/software').then(setSoftware).catch((err) => setError(err.message));
  }, []);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/versions', { method: 'POST', body: form });
      navigate('/admin/versions', { state: { message: 'Version published.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Row className="justify-content-center">
      <Col lg={7}>
        <Card>
          <Card.Body className="p-4">
            <h2 className="h3 text-center text-primary">Create Version Release</h2>
            <p className="text-center text-secondary">Fill in release details to publish a new software version</p>
            <Form onSubmit={onSubmit}>
              <Message>{error}</Message>
              <Form.Group className="mb-3" controlId="software">
                <Form.Label>Software <span className="text-danger">*</span></Form.Label>
                <Form.Select name="software" value={form.software} onChange={update} required>
                  <option value="">Select software repository or package...</option>
                  {software.map((item) => <option key={item._id} value={item._id}>{item.software_name}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="version_number">
                <Form.Label>Version <span className="text-danger">*</span></Form.Label>
                <Form.Control name="version_number" placeholder="e.g. v2.4.0 or v3.1.2-rc" value={form.version_number} onChange={update} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="release_date">
                <Form.Label>Target Release Date <span className="text-danger">*</span></Form.Label>
                <Form.Control name="release_date" type="date" value={form.release_date} onChange={update} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="release_notes">
                <Form.Label>Release Notes / Changelog <span className="text-danger">*</span></Form.Label>
                <Form.Control as="textarea" rows={5} name="release_notes" placeholder="Document changelog summary, architectural patches, and upgrade guidance..." value={form.release_notes} onChange={update} required />
              </Form.Group>
              <Button type="submit" className="w-100" disabled={busy}>{busy ? 'Publishing...' : 'Publish Version'}</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}