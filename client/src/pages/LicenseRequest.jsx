import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { Message } from '../components/ui';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

export default function LicenseRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [software, setSoftware] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/software/${id}`).then(setSoftware).catch((err) => setError(err.message));
  }, [id]);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/api/licenses', {
        method: 'POST',
        body: {
          assigned_software: software._id,
          version_number: software.latest_version?._id,
          reason,
        },
      });
      navigate('/licenses', { state: { message: 'License request submitted.' } });
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
            <h2 className="h3 text-center text-primary mb-4">New Software License Request</h2>
            <Form onSubmit={onSubmit}>
              <Message>{error}</Message>
              {!software ? <p className="text-center text-secondary">Loading software...</p> : null}
              {software ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Software Title</Form.Label>
                    <div className="fw-semibold">{software.software_name}</div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Version</Form.Label>
                    <div className="fw-semibold">{software.latest_version?.version_number || '—'}</div>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="reason">
                    <div className="d-flex justify-content-between">
                      <Form.Label>Business Reason / Justification</Form.Label>
                      <span className="text-secondary small">{reason.length} / 500</span>
                    </div>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      maxLength={500}
                      placeholder="Please explain your project requirement and why this software license is needed..."
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" className="w-100" disabled={busy || !software.latest_version}>
                    {busy ? 'Submitting...' : 'Submit License Request'}
                  </Button>
                </>
              ) : null}
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}