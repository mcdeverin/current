import React from "react";

export default function Layout({ children, currentPageName }) {
  // No layout wrapping for onboarding or milestone
  if (currentPageName === "Onboarding" || currentPageName === "Milestone") {
    return <>{children}</>;
  }

  return <>{children}</>;
}