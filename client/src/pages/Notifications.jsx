import { useEffect, useState } from 'react';
import { api } from '../api';
import { Message, PageHeader } from '../components/ui';
import { formatNotificationTime } from '../utils/format';
import Card from 'react-bootstrap/Card';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/notifications').then(setItems).catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <PageHeader title="Notifications" />
      <Message>{error}</Message>
      {items.map((item) => (
        <Card className="mb-3" key={item._id}>
          <Card.Body>
            <p className="mb-2">
              <span className="text-secondary small fw-semibold me-2">MESSAGE:</span>
              {item.message}
            </p>
            <p className="text-secondary mb-0">
              <span className="small fw-semibold me-2">CREATED AT:</span>
              {formatNotificationTime(item.created_at)}
            </p>
          </Card.Body>
        </Card>
      ))}
      {items.length === 0 && !error ? <p className="text-center text-secondary py-4 mb-0">No notifications yet.</p> : null}
    </section>
  );
}
