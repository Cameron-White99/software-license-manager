import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

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

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar bg="white" className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/login" className="text-primary fw-bold">License Manager</Navbar.Brand>
          <Nav className="ms-auto">
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
              <Nav.Link as={Link} to="/login">Sign In</Nav.Link>
            )}
          </Nav>
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
