
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyFeedback } from '../api/feedback.js';

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

        if (active) setFeedback(data);
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load feedback history.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeedback();

    return () => {
      active = false;
    };
  }, []);

  function formatFeedbackDate(value) {
    if (!value) return 'N/A';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleString('en-AU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  return (
    <div className="container py-4">
      <div
        className="bg-white border rounded-3 shadow-sm mx-auto"
        style={{ maxWidth: '760px' }}
      >
        <div className="p-4 p-md-5">

          {/* Figma-aligned heading and action */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h2 className="fw-bold text-primary mb-0">
              My Past Feedback
            </h2>

            <Button
              as={Link}
              to="/feedback/new"
              variant="primary"
              className="px-3"
            >
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
              <p className="text-secondary mt-3 mb-0">
                Loading your feedback...
              </p>
            </div>
          ) : error ? null : feedback.length === 0 ? (
            <div className="text-center py-5 border-top">
              <h5 className="fw-semibold">
                No Feedback Submitted Yet
              </h5>
              <p className="text-secondary mb-0">
                You have not submitted feedback for any software version.
              </p>
            </div>
          ) : (
            <div className="border-top">
              {feedback.map((item, index) => (
                <article
                  key={item._id}
                  className={`py-4 ${
                    index !== feedback.length - 1
                      ? 'border-bottom'
                      : ''
                  }`}
                >
                  {/* Software, version and score */}
                  <div className="d-flex flex-wrap align-items-start gap-3 mb-3">
                    <div className="flex-grow-1">
                      <h5 className="fw-semibold mb-0">
                        {item.version?.software?.software_name ||
                          'Unknown Software'}
                      </h5>

                      <div className="fw-semibold small">
                        {item.version?.version_number || 'N/A'}
                      </div>
                    </div>

                    <span
                      className="badge rounded-1 px-2 py-2"
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#0d6efd',
                      }}
                    >
                      Score: {item.rating}/5
                    </span>

                    <div
                      className="small text-secondary"
                      style={{ minWidth: '150px' }}
                    >
                      Submitted on{' '}
                      {formatFeedbackDate(item.created_at)}
                    </div>
                  </div>

                  {/* Feedback comments */}
                  <p
                    className="text-secondary mb-0"
                    style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.comments}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
