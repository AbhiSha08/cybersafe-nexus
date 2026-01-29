import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

// We render without the StrictMode wrap if you experience 
// double-renders in your SIEM analytics dashboard during development.
root.render(<App />);