import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

// CareerOS Theme
const savedTheme = localStorage.getItem("career-os-theme");

if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <AuthProvider>
    <ProfileProvider>
      <App />
    </ProfileProvider>
  </AuthProvider>
);