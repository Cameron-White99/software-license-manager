
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyFeedback } from '../api/feedback.js';
import Header from '../components/Header.jsx';

import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function PastFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadFeedback() {
      try {
        const data = await fetchMyFeedback();

        if (!Array.isArray(data)) {
          throw new Error('Invalid feedback history response.');
        }

        if (active) {
          setFeedback(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load feedback history.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFeedback();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Header role="User" />

      <div className="container py-5" style={{ maxWidth: '900px' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-semibold mb-1">My Past Feedback</h2>
            <p className="text-secondary mb-0">
              View feedback you have submitted for software versions.
            </p>
          </div>

          <Button as={Link} to="/feedback">
            Add Feedback
          </Button>
        </div>

        {error && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <p className="text-secondary mt-3">
              Loading your feedback...
            </p>
          </div>
        ) : error ? null : feedback.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <h5>No Feedback Submitted Yet</h5>
              <p className="text-secondary">
                You have not submitted feedback for any software version.
              </p>
              <Button as={Link} to="/feedback">
                Add Feedback
              </Button>
            </Card.Body>
          </Card>
        ) : (
          feedback.map((item) => (
            <Card
              key={item._id}
              className="mb-3 border-0 shadow-sm"
              style={{ borderRadius: '12px' }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h5 className="fw-semibold mb-1">
                      {item.version?.software?.software_name ||
                        'Unknown Software'}
                    </h5>

                    <div className="text-secondary small">
                      Version: {item.version?.version_number || 'N/A'}
                    </div>
                  </div>

                  <span className="badge bg-primary rounded-pill px-3 py-2">
                    {item.rating} / 5
                  </span>
                </div>

                <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                  {item.comments}
                </p>

                <small className="text-secondary">
                  Submitted:{' '}
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : 'N/A'}
                </small>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
