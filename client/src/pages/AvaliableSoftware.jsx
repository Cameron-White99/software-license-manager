import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Message, PageHeader, SearchBox } from '../components/ui';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

export default function AvailableSoftware() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/software').then(setItems).catch((err) => setError(err.message));
  }, []);

  const visible = items.filter((item) => item.software_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <section>
      <PageHeader title="Available Software" />
      <Message>{error}</Message>
      <SearchBox value={query} onChange={setQuery} placeholder="Search software by name or category..." />
      <Row xs={1} md={2} lg={3} className="g-3">
        {visible.map((item) => (
          <Col key={item._id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>{item.software_name}</Card.Title>
                <Card.Subtitle className="mb-2 text-secondary">
                  Version: {item.latest_version?.version_number || 'Not published'}
                </Card.Subtitle>
                <Card.Text className="flex-grow-1">
                  {item.latest_version?.release_notes || 'A published version is not available yet.'}
                </Card.Text>
                {item.latest_version ? (
                  <Button as={Link} to={`/software/${item._id}/request`}>Request License</Button>
                ) : (
                  <Button type="button" disabled>Request License</Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {!error && visible.length === 0 ? <p className="text-center text-secondary py-4 mb-0">No software matches your search.</p> : null}
    </section>
  );
}