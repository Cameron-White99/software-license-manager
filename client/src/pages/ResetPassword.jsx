
import { useState } from 'react';
import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function onSubmit(event) {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(
      'Password reset emails are not available yet. Please contact your administrator.'
    );
  }

  return (
    <Row className="justify-content-center py-5">
      <Col xs={12} sm={9} md={7} lg={5} xl={4}>
        <Card className="shadow-sm">
          <Card.Body className="px-4 pt-4 pb-5">
            <h2 className="h4 text-center text-primary fw-semibold mb-2">
              Reset Password
            </h2>

            <p className="text-center text-secondary small mb-4">
              We will send you a reset link
            </p>

            {error && (
              <Alert variant="warning" role="alert">
                {error}
              </Alert>
            )}

            <Form onSubmit={onSubmit}>
              <Form.Group
                className="mb-4"
                controlId="resetPasswordEmail"
              >
                <Form.Label className="small text-secondary">
                  Email Address
                </Form.Label>

                <Form.Control
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </Form.Group>

              <Button type="submit" className="w-100">
                Send Reset Link
              </Button>
            </Form>
          </Card.Body>

          <Card.Footer className="bg-white text-center py-3">
            <Link to="/login" className="text-decoration-none">
              Back to Sign In
            </Link>
          </Card.Footer>
        </Card>
      </Col>
    </Row>
  );
}
