
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { submitFeedback, fetchMyFeedback } from '../api/feedback.js';
import Header from '../components/Header.jsx';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

export default function FeedbackForm() {
  const [versions, setVersions] = useState([]);
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [version, setVersion] = useState('');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [versionResponse, feedbackResponse] =
          await Promise.all([
            api('/api/versions'),
            fetchMyFeedback()
          ]);

        // Version API may use an ApiResponse wrapper.
        const versionList = Array.isArray(versionResponse)
          ? versionResponse
          : versionResponse.data;

        if (!Array.isArray(versionList)) {
          throw new Error('Invalid software version response.');
        }

        if (!Array.isArray(feedbackResponse)) {
          throw new Error('Invalid feedback response.');
        }

        if (active) {
          setVersions(versionList);
          setExistingFeedback(feedbackResponse);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const submittedVersionIds = new Set(
    existingFeedback.map((item) =>
      typeof item.version === 'object'
        ? item.version?._id
        : item.version
    )
  );

  const availableVersions = versions.filter(
    (item) => !submittedVersionIds.has(item._id)
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!version) {
      setError('Please select a software version.');
      return;
    }

    const trimmedComments = comments.trim();

    if (!trimmedComments) {
      setError('Please enter your feedback comments.');
      return;
    }

    if (trimmedComments.length > 1000) {
      setError('Feedback comments cannot exceed 1000 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const createdFeedback = await submitFeedback({
        version,
        rating: Number(rating),
        comments: trimmedComments
      });

      setExistingFeedback((previous) => [
        createdFeedback,
        ...previous
      ]);

      setVersion('');
      setRating(5);
      setComments('');
      setSuccess('Your feedback was submitted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header role="User" />

      <div className="container py-4">
        <Card className="mx-auto shadow-sm" style={{ maxWidth: 650 }}>
          <Card.Body className="p-4">
            <h2 className="mb-2">Submit Feedback</h2>
            <p className="text-secondary">
              Share your experience with a software version.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <p className="mt-2">Loading software versions...</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Software Version</Form.Label>
                  <Form.Select
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                    required
                  >
                    <option value="">Select software version</option>

                    {availableVersions.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.software?.software_name || 'Software'}
                        {' — '}
                        {item.version_number}
                      </option>
                    ))}
                  </Form.Select>

                  {availableVersions.length === 0 && (
                    <Form.Text className="text-secondary">
                      No versions available for new feedback.
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select
                    value={rating}
                    onChange={(event) =>
                      setRating(Number(event.target.value))
                    }
                    required
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Very Poor</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={comments}
                    maxLength={1000}
                    placeholder="Write your feedback here..."
                    onChange={(event) =>
                      setComments(event.target.value)
                    }
                    required
                  />
                  <div className="text-end text-secondary small mt-1">
                    {comments.length} / 1000 characters
                  </div>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    type="submit"
                    disabled={
                      submitting ||
                      loading ||
                      availableVersions.length === 0
                    }
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>

                  <Link to="/feedback/history">
                    View Past Feedback
                  </Link>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
