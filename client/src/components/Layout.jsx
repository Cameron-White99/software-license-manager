import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const userLinks = [
  { to: '/software', label: 'Available Software' },
  { to: '/licenses', label: 'My License History' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/software', label: 'Software Catalog' },
  { to: '/admin/versions', label: 'Version Releases' },
  { to: '/admin/users', label: 'User Directory' },
  { to: '/admin/requests', label: 'Request Queue' },
  { to: '/notifications', label: 'Notifications' },
];

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center text-secondary">
        <Spinner animation="border" size="sm" className="me-2" />
        Loading...
      </div>
    );
  }

  const links = user ? (user.role === 'admin' ? adminLinks : userLinks) : [];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar bg="white" expand="lg" className="border-bottom sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="text-primary fw-bold">License Manager</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto align-items-lg-center">
              {links.map((link) => (
                <Nav.Link key={link.to} as={NavLink} to={link.to}>{link.label}</Nav.Link>
              ))}
              {user ? (
                <Button
                  variant="link"
                  className="nav-link"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Sign In</Nav.Link>
                  <Button as={Link} to="/register" variant="outline-primary" size="sm" className="ms-lg-2">Create Account</Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="flex-grow-1 py-4">
        <Container>
          <Outlet />
        </Container>
      </main>
      <footer className="text-center text-secondary py-3 border-top bg-white">
        License Manager © {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}