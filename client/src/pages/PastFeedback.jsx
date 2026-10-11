
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
          throw new Error('Invalid feedback response.');
        }

        if (active) {
          setFeedback(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
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

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Past Feedback</h2>

          <Button as={Link} to="/feedback">
            Submit New Feedback
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading your feedback...</p>
          </div>
        ) : feedback.length === 0 ? (
          <Card className="text-center">
            <Card.Body className="py-5">
              <h5>No Feedback Submitted Yet</h5>
              <p className="text-secondary">
                You have not submitted feedback for any software version.
              </p>

              <Button as={Link} to="/feedback">
                Submit Feedback
              </Button>
            </Card.Body>
          </Card>
        ) : (
          feedback.map((item) => (
            <Card key={item._id} className="mb-3 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">
                      {item.version?.software?.software_name ||
                        'Unknown Software'}
                    </h5>

                    <p className="text-secondary mb-2">
                      Version: {item.version?.version_number || 'N/A'}
                    </p>
                  </div>

                  <span className="badge bg-primary">
                    {item.rating} / 5
                  </span>
                </div>

                <p className="mb-2">{item.comments}</p>

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

