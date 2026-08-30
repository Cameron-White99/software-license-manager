import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AddLicense from "./pages/AddLicense.jsx";

// Next up (per build order): /requests (R1/R2/R3), /assignments (R5/R6), /history (R8)
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/licenses" element={<AddLicense />} />
        <Route path="*" element={<Navigate to="/licenses" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
