
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  fetchFeedbackVersions,
  fetchMyFeedback,
  submitFeedback,
} from '../api/feedback.js';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
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
  const requestedVersionId = searchParams.get('version_id');

  // Load available versions and the user's previous feedback.
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [versionList, feedbackList] = await Promise.all([
          fetchFeedbackVersions(),
          fetchMyFeedback(),
        ]);

        if (!Array.isArray(versionList) || !Array.isArray(feedbackList)) {
          throw new Error('Unable to load feedback data.');
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

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Prevent duplicate feedback for already reviewed versions.
  const submittedIds = useMemo(
    () =>
      new Set(
        existingFeedback.map((item) =>
          String(item.version?._id || item.version)
        )
      ),
    [existingFeedback]
  );

  const availableVersions = useMemo(
    () =>
      versions.filter(
        (item) => !submittedIds.has(String(item._id))
      ),
    [versions, submittedIds]
  );

  // Preselect a version when opened from another page.
  useEffect(() => {
    if (!requestedVersionId) return;

    const exists = availableVersions.some(
      (item) => String(item._id) === requestedVersionId
    );

    if (exists) {
      setVersion(requestedVersionId);
    }
  }, [requestedVersionId, availableVersions]);

  // Validate and submit feedback.
  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError('');
    setSuccess('');

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

    const cleanedComments = comments.trim();

    if (!cleanedComments) {
      setError('Please enter your feedback comments.');
      return;
    }

    if (cleanedComments.length > 1000) {
      setError('Feedback comments cannot exceed 1000 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const created = await submitFeedback({
        versionId: version,
        rating: selectedRating,
        comments: cleanedComments,
      });

      if (!created?._id) {
        throw new Error('Invalid feedback submission response.');
      }

      setExistingFeedback((previous) => [
        created,
        ...previous,
      ]);

      setVersion('');
      setRating('');
      setComments('');

      setSuccess('Feedback submitted successfully.');
    } catch (err) {
      setError(err.message || 'Unable to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-4">
      <div
        className="bg-white border rounded-3 shadow-sm mx-auto"
        style={{ maxWidth: '620px' }}
      >
        <div className="p-4 p-md-5">

          {/* Figma-inspired blue heading */}
          <h2 className="fw-bold mb-2 text-primary">
            Submit Version Feedback
          </h2>

          <p className="text-secondary mb-4">
            Share your experience with a software version.
          </p>

          {/* Error and success messages */}
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
              <Form.Group
                className="mb-4"
                controlId="feedbackVersion"
              >
                <Form.Label className="fw-semibold">
                  Software Version
                </Form.Label>

                <Form.Select
                  value={version}
                  onChange={(event) => {
                    setVersion(event.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  disabled={
                    submitting ||
                    availableVersions.length === 0
                  }
                  required
                >
                  <option value="">
                    Select software version
                  </option>

                  {availableVersions.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
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
              <Form.Group
                className="mb-4"
                controlId="feedbackRating"
              >
                <Form.Label className="fw-semibold">
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
                  <option value="">
                    Select rating
                  </option>
                  <option value="1">1 - Very Poor</option>
                  <option value="2">2 - Poor</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </Form.Select>
              </Form.Group>

              {/* Comments */}
              <Form.Group
                className="mb-4"
                controlId="feedbackComments"
              >
                <Form.Label className="fw-semibold">
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

                <Form.Text className="text-secondary">
                  Maximum 1000 characters.
                </Form.Text>
              </Form.Group>

              {/* Full-width submit button */}
              <Button
                type="submit"
                variant="primary"
                className="w-100 fw-semibold py-2"
                disabled={
                  submitting ||
                  availableVersions.length === 0
                }
              >
                {submitting
                  ? 'SUBMITTING...'
                  : 'SUBMIT FEEDBACK'}
              </Button>

              {/* Navigation back to feedback history */}
              <div className="text-center mt-3">
                <Link
                  to="/feedback"
                  className="text-decoration-none"
                >
                  View Past Feedback
                </Link>
              </div>

            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
