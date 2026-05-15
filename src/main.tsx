import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Header } from "./component/header.tsx";
import App from "./App.tsx";
import Login from "./pages/login.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>,
);
