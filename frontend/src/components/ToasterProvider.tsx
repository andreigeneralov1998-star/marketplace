"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "16px",
          background: "#FFFFFF",
          color: "#111827",
          padding: "14px 16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 8px 24px rgba(16, 24, 40, 0.08)",
          fontSize: "14px",
          lineHeight: "20px",
        },
        success: {
          iconTheme: {
            primary: "#F5A623",
            secondary: "#FFFFFF",
          },
        },
        error: {
          iconTheme: {
            primary: "#B42318",
            secondary: "#FFFFFF",
          },
        },
      }}
    />
  );
}