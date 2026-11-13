import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import StaticApp from "@/components/StaticApp";
import { LocaleProvider } from "@/context/LocaleContext";
import "@/src/globals.css";

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/en" replace />} />
          <Route path="/en/*" element={<StaticApp />} />
          <Route path="/ar/*" element={<StaticApp />} />
          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
