import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import CreateAccount from './pages/CreateAccount';
import Notifications from './pages/Notifications';
import ResetPassword from './pages/ResetPassword';


function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/software' : '/software'} replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  return <Navigate to="/login" replace />;
}

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/software' : '/software'} replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={user ? <p className="text-center text-secondary">Signed in as {user.full_name}.</p> : <GuestOnly><SignIn /></GuestOnly>} />
	      <Route path="/register" element={<GuestOnly><CreateAccount /></GuestOnly>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        {/* <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} /> */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />
      </Route>
    </Routes>
  );
}