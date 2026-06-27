import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--panel)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          fontSize: "13.5px",
        },
        success: { iconTheme: { primary: "var(--accent2)", secondary: "var(--bg)" } },
        error:   { iconTheme: { primary: "var(--danger)",  secondary: "var(--bg)" } },
      }}
    />
  </React.StrictMode>
);
