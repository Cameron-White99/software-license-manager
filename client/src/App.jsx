import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';

import Layout from './components/Layout.jsx';
import SignIn from './pages/SignIn.jsx';
import CreateAccount from './pages/CreateAccount.jsx';
import Notifications from './pages/Notifications.jsx';

// Feedback Module - Abhay
import FeedbackForm from './pages/FeedbackForm.jsx';
import PastFeedback from './pages/PastFeedback.jsx';

// Temporary home destinations until the original
// Software and Admin routes are integrated.
function getHomePath(user) {
  return user.role === 'admin'
    ? '/notifications'
    : '/feedback';
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomePath(user)} replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return children;

  return <Navigate to={getHomePath(user)} replace />;
}

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/login"
          element={
            <GuestOnly>
              <SignIn />
            </GuestOnly>
          }
        />

        <Route
          path="/register"
          element={
            <GuestOnly>
              <CreateAccount />
            </GuestOnly>
          }
        />

        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Notifications />
            </RequireAuth>
          }
        />

        {/* Feedback Module - Abhay */}
        <Route
          path="/feedback"
          element={
            <RequireAuth role="user">
              <FeedbackForm />
            </RequireAuth>
          }
        />

        <Route
          path="/feedback/history"
          element={
            <RequireAuth role="user">
              <PastFeedback />
            </RequireAuth>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Route>
    </Routes>
  );
}
