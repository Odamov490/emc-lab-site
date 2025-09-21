import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // 🔹 routing uchun qo‘shildi
import "./index.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>     {/* 🔹 endi App ichida sahifalar o‘zgaradi */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
