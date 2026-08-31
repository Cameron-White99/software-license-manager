import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AddLicense from "./pages/AddLicense.jsx";
import SubmitRequest from "./pages/SubmitRequest.jsx";
import PendingQueue from "./pages/PendingQueue.jsx";
import ApproveReject from "./pages/ApproveReject.jsx";

// Next up (per build order): /my-requests (R4), /assignments (R5/R6), /history (R8)
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/licenses" element={<AddLicense />} />
        <Route path="/requests/new" element={<SubmitRequest />} />
        <Route path="/requests" element={<PendingQueue />} />
        <Route path="/requests/:id" element={<ApproveReject />} />
        <Route path="*" element={<Navigate to="/licenses" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
