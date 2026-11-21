import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppProviders from "./app/AppProviders.jsx";
import "./styles/index.css";
import App from "./app/App.jsx";

// Application entry point: keep this minimal, compose providers in app/AppProviders.jsx.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
