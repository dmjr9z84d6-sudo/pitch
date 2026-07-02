import React from "react";
import { createRoot } from "react-dom/client";
import PitchApp from "./PitchApp.jsx";

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(React.createElement(PitchApp));
}
