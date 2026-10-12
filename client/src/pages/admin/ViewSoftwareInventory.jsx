import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Message } from '../../components/ui';
import { formatDate, formatSubmitted } from '../../utils/format';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';

export default function ViewSoftwareInventory() {
  const { id } = useParams();
  const [software, setSoftware] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    setSoftware(null);
    Promise.all([
      api(`/api/software/${id}`),
      api(`/api/feedback/software/${id}`),
    ])
      .then(([softwareResult, feedbackResult]) => {
        if (!active) return;
        setSoftware(softwareResult);
        setFeedback(feedbackResult);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => { active = false; };
  }, [id]);

  const feedbackByVersion = feedback.reduce((groups, item) => {
    const versionId = String(item.version);
    if (!groups[versionId]) groups[versionId] = [];
    groups[versionId].push(item);
    return groups;
  }, {});

  return (
    <section>
      <div className="mb-3">
        <Button as={Link} to="/admin/software" variant="outline-secondary" size="sm">Back to inventory</Button>
      </div>
      <Message>{error}</Message>
      {!software && !error ? <p className="text-secondary">Loading software...</p> : null}
      {software ? (
        <>
          <Card className="mb-4">
            <Card.Body>
              <h1 className="h3 mb-2">{software.software_name}</h1>
              <p className="text-secondary mb-0">Created {formatDate(software.created_at)}</p>
            </Card.Body>
          </Card>
          <h2 className="h5 mb-3">Versions and feedback</h2>
          {(software.versions || []).length === 0 ? (
            <p className="text-secondary">This software has no published versions.</p>
          ) : null}
          {(software.versions || []).map((version) => {
            const reviews = feedbackByVersion[String(version._id)] || [];
            return (
              <Card className="mb-3" key={version._id}>
                <Card.Body>
                  <Stack direction="horizontal" className="justify-content-between align-items-start flex-wrap mb-2" gap={2}>
                    <h3 className="h5 mb-0">{version.version_number}</h3>
                    <span className="text-secondary small">Released {formatDate(version.release_date)}</span>
                  </Stack>
                  <p className="mb-3">{version.release_notes}</p>
                  <h4 className="h6 text-secondary">Feedback</h4>
                  {reviews.length === 0 ? <p className="text-secondary mb-0">No feedback for this version.</p> : null}
                  {reviews.map((item) => (
                    <article className="border-top pt-3 mt-3" key={item._id}>
                      <Stack direction="horizontal" className="justify-content-between align-items-start flex-wrap" gap={2}>
                        <div>
                          <div className="fw-semibold">{item.user?.full_name}</div>
                          <div className="text-secondary small">{item.user?.email}</div>
                        </div>
                        <Badge bg="primary">Score: {item.rating}/5</Badge>
                      </Stack>
                      <p className="mt-2 mb-1">{item.comments}</p>
                      <div className="text-secondary small">{formatSubmitted(item.created_at)}</div>
                    </article>
                  ))}
                </Card.Body>
              </Card>
            );
          })}
        </>
      ) : null}
    </section>
  );
}
