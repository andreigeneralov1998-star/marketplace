export const designTokens = {
  colors: {
    page: "#F7F8FA",
    surface: "#FFFFFF",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    brand: "#F5A623",
    brandHover: "#E69512",
    brandSoft: "#FFF4DD",
    graphite: "#1F2937",
    deepDark: "#0F172A",
  },
  radius: {
    card: 16,
    control: 12,
    modal: 20,
    pill: 999,
  },
  shadow: {
    base: "0 1px 2px rgba(16, 24, 40, 0.04)",
    hover: "0 8px 24px rgba(16, 24, 40, 0.08)",
    modal: "0 16px 40px rgba(16, 24, 40, 0.12)",
  },
  layout: {
    container: 1440,
    content: 1320,
    headerHeight: 72,
    sidebarCatalog: 280,
  },
  controlHeights: {
    compact: 36,
    tab: 40,
    default: 44,
    cta: 48,
  },
} as const;