import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { initAuth } from "./store/useAuthStore";
import "./index.css";
import App from "./App.jsx";

initAuth();

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/OTT_Project">
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
);
