import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import RecoveredCases from "./pages/RecoveredCases";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/recovered" element={<RecoveredCases />} />
      </Routes>

      <Toaster position="top-right" richColors />
    </>
  );
}