import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { StoreProvider } from "./Store/Store.jsx";
import 'remixicon/fonts/remixicon.css';
import { GoogleOAuthProvider } from "@react-oauth/google";
import.meta.env;
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
      </GoogleOAuthProvider>
    </StoreProvider>
  </React.StrictMode>
);





