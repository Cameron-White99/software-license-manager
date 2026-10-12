import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Message, PageHeader } from '../components/ui';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const updated = await api('/api/users/me', { method: 'PUT', body: profile });
      setUser(updated);
      setMessage('Profile saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const result = await api('/api/users/me/password', { method: 'PUT', body: passwords });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader title="User Profile Management" subtitle="Manage enterprise account credentials, administrative identity, and security settings." />
      <Row className="justify-content-center">
        <Col lg={8}>
          <Message type="success">{message}</Message>
          <Message>{error}</Message>
          <Card className="mb-3">
            <Card.Body>
              <h2 className="h5 text-primary border-bottom pb-3 mb-3">Personal Information</h2>
              <Form onSubmit={saveProfile}>
                <Form.Group className="mb-3" controlId="full_name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
                </Form.Group>
                <Button type="submit">Save Changes</Button>
              </Form>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <h2 className="h5 text-primary border-bottom pb-3 mb-3">Security & Password</h2>
              <Form onSubmit={savePassword}>
                <Form.Group className="mb-3" controlId="current">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control type="password" placeholder="Enter current password" value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="next">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" placeholder="Enter new password" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} required />
                  <Form.Text className="text-secondary">Must be at least 8 characters with a mix of letters and numbers.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirm">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control type="password" placeholder="Re-enter new password" value={passwords.confirm_password} onChange={(event) => setPasswords({ ...passwords, confirm_password: event.target.value })} required />
                </Form.Group>
                <Button type="submit">Update Password</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
}