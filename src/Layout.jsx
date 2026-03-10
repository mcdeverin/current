import React from "react";
import { ThemeProvider } from "./components/current/ThemeContext";

export default function Layout({ children, currentPageName }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}