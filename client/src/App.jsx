import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AddLicense from "./pages/AddLicense.jsx";
import SubmitRequest from "./pages/SubmitRequest.jsx";
import PendingQueue from "./pages/PendingQueue.jsx";
import ApproveReject from "./pages/ApproveReject.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import MyLicenses from "./pages/MyLicenses.jsx";
import ActiveAssignments from "./pages/ActiveAssignments.jsx";
import RevokeConfirm from "./pages/RevokeConfirm.jsx";

// Next up (per build order): /history (R8)
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/licenses" element={<AddLicense />} />
        <Route path="/requests/new" element={<SubmitRequest />} />
        <Route path="/requests" element={<PendingQueue />} />
        <Route path="/requests/:id" element={<ApproveReject />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/my-licenses" element={<MyLicenses />} />
        <Route path="/assignments" element={<ActiveAssignments />} />
        <Route path="/assignments/:id/revoke" element={<RevokeConfirm />} />
        <Route path="*" element={<Navigate to="/licenses" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
