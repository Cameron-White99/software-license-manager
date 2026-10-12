import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import CreateAccount from './pages/CreateAccount';
import ResetPassword from './pages/ResetPassword';
import AvailableSoftware from './pages/AvailableSoftware';
import LicenseRequest from './pages/LicenseRequest';
import LicenseHistory from './pages/LicenseHistory';
import FeedbackForm from './pages/FeedbackForm';
import PastFeedback from './pages/PastFeedback';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import SoftwareInventory from './pages/admin/SoftwareInventory';
import ViewSoftwareInventory from './pages/admin/ViewSoftwareInventory';
import VersionList from './pages/admin/VersionList';
import CreateVersion from './pages/admin/CreateVersion';
import UserDirectory from './pages/admin/UserDirectory';
import RequestQueue from './pages/admin/RequestQueue';

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
  return <Navigate to={user.role === 'admin' ? '/admin/software' : '/software'} replace />;
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
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<GuestOnly><SignIn /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><CreateAccount /></GuestOnly>} />
        <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />

        <Route path="/software" element={<RequireAuth role="user"><AvailableSoftware /></RequireAuth>} />
        <Route path="/software/:id/request" element={<RequireAuth role="user"><LicenseRequest /></RequireAuth>} />
        <Route path="/licenses" element={<RequireAuth role="user"><LicenseHistory /></RequireAuth>} />
        <Route path="/feedback" element={<RequireAuth role="user"><PastFeedback /></RequireAuth>} />
        <Route path="/feedback/new" element={<RequireAuth role="user"><FeedbackForm /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth role="user"><Profile /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

        <Route path="/admin/software" element={<RequireAuth role="admin"><SoftwareInventory /></RequireAuth>} />
        <Route path="/admin/software/:id" element={<RequireAuth role="admin"><ViewSoftwareInventory /></RequireAuth>} />
        <Route path="/admin/versions" element={<RequireAuth role="admin"><VersionList /></RequireAuth>} />
        <Route path="/admin/versions/new" element={<RequireAuth role="admin"><CreateVersion /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth role="admin"><UserDirectory /></RequireAuth>} />
        <Route path="/admin/requests" element={<RequireAuth role="admin"><RequestQueue /></RequireAuth>} />
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  );
}
