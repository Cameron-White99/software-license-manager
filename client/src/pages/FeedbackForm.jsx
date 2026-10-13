
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { fetchFeedbackVersions, fetchMyFeedback, submitFeedback } from '../api/feedback.js';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

export default function FeedbackForm() {
  const [versions, setVersions] = useState([]);
  const [existingFeedback, setExistingFeedback] = useState([]);

  const [version, setVersion] = useState('');
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchParams] = useSearchParams();
  const versionId = searchParams.get('version_id');

  // SLM-162: Load software versions and previously submitted feedback.
  useEffect(() => {
    let active = true;

    async function loadFeedbackData() {
      try {
        const [versionList, feedbackList] = await Promise.all([
          fetchFeedbackVersions(),
          fetchMyFeedback()
        ]);

        if (!Array.isArray(versionList)) {
          throw new Error('Unable to load software versions.');
        }

        if (!Array.isArray(feedbackList)) {
          throw new Error('Unable to load feedback history.');
        }

        if (active) {
          setVersions(versionList);

          setExistingFeedback(feedbackList);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load feedback form.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFeedbackData();

    return () => {
      active = false;
    };
  }, []);

  // Prevent submitting feedback twice for the same software version.
  const submittedVersionIds = new Set([]);

  const availableVersions = versions.filter(
    (item) => !submittedVersionIds.has(String(item._id))
  );

  useEffect(() => {
    if (!versionId) return;
    const match = availableVersions.some((item) => String(item._id) === versionId);
    if (match) setVersion(versionId);
  }, [versionId, availableVersions]);

  // SLM-162: Validate and submit feedback.
  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (submitting) return;

    if (!version) {
      setError('Please select a software version.');
      return;
    }

    const selectedRating = Number(rating);

    if (
      rating === '' ||
      !Number.isInteger(selectedRating) ||
      selectedRating < 1 ||
      selectedRating > 5
    ) {
      setError('Please select a rating between 1 and 5.');
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
        versionId: version,
        rating: selectedRating,
        comments: trimmedComments
      });

      if (!createdFeedback?._id) {
        throw new Error('Invalid feedback submission response.');
      }

      setExistingFeedback((previous) => [
        createdFeedback,
        ...previous
      ]);

      // Reset form.
      setVersion('');
      setRating('');
      setComments('');

      setSuccess('Your feedback was submitted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <div className="container py-5">
        <Card
          className="mx-auto border-0 shadow-sm"
          style={{ maxWidth: '620px', borderRadius: '12px' }}
        >
          <Card.Body className="p-4 p-md-5">
            <h2 className="fw-semibold mb-2">
              Version Feedback
            </h2>

            <p className="text-secondary mb-4">
              Share your experience with a software version.
            </p>

            {error && (
              <Alert variant="danger" role="alert">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" role="status">
                {success}
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" />
                <p className="text-secondary mt-3 mb-0">
                  Loading software versions...
                </p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                {/* Software Version */}
                <Form.Group className="mb-4" controlId="feedbackVersion">
                  <Form.Label className="fw-medium">
                    Software Version
                  </Form.Label>

                  <Form.Select
                    value={version}
                    onChange={(event) => {
                      setVersion(event.target.value);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={submitting || availableVersions.length === 0}
                    required
                  >
                    <option value="">
                      Select software version
                    </option>

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
                      No software versions available for new feedback.
                    </Form.Text>
                  )}
                </Form.Group>

                {/* Rating */}
                <Form.Group className="mb-4" controlId="feedbackRating">
                  <Form.Label className="fw-medium">
                    Rating Score (1–5)
                  </Form.Label>

                  <Form.Select
                    value={rating}
                    onChange={(event) => {
                      setRating(event.target.value);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={submitting}
                    required
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Very Poor</option>
                    <option value="2">2 - Poor</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </Form.Select>
                </Form.Group>

                {/* Comments */}
                <Form.Group className="mb-4" controlId="feedbackComments">
                  <Form.Label className="fw-medium">
                    Comments
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={comments}
                    maxLength={1000}
                    placeholder="Write your feedback here..."
                    disabled={submitting}
                    onChange={(event) => {
                      setComments(event.target.value);
                      setError('');
                      setSuccess('');
                    }}
                    required
                  />

                  <div className="text-end text-secondary small mt-2">
                    {comments.length} / 1000 characters
                  </div>
                </Form.Group>

                {/* Submit and History */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <Button
                    type="submit"
                    disabled={
                      submitting ||
                      availableVersions.length === 0
                    }
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </Button>

                  <Link
                    to="/feedback/history"
                    className="text-decoration-none"
                  >
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
