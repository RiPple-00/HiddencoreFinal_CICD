export const COLORS = {
  bgWhite: "#FFFFFF",
  bgGray: "#F4F6F8",

  textPrimary: "#0f172a",
  textSecondary: "#334155",
  textMuted: "#64748b",
  textLight: "#94a3b8",

  borderLight: "#e5e7eb",
  borderNormal: "#d1d5db",

  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue400: "#60a5fa",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",

  green50: "#ecfdf5",
  green200: "#a7f3d0",
  green600: "#059669",
  green700: "#047857",

  orange50: "#fff7ed",
  orange200: "#fed7aa",
  orange700: "#c2410c",

  red50: "#fef2f2",
  red100: "#fee2e2",
  red400: "#f87171",
  red500: "#ef4444",
  red600: "#dc2626",
};

export const TAG_COLORS = {
  진료비: { bg: "#ecfeff", text: "#155e75" },
  식대: { bg: "#f0fdf4", text: "#166534" },
  입원비: { bg: "#fdf4ff", text: "#86198f" },
  입원료: { bg: "#f5f3ff", text: "#5b21b6" },
  약제비: { bg: "#fffbeb", text: "#92400e" },
};

export const STATUS_COLORS = {
  완납: { bg: COLORS.green50, text: COLORS.green700, amount: COLORS.green700 },
  부분납: { bg: COLORS.orange50, text: COLORS.orange700, amount: COLORS.orange700 },
  미납: { bg: COLORS.red50, text: COLORS.red600, amount: COLORS.red600 },
  완료: { bg: COLORS.green50, text: COLORS.green700, amount: COLORS.textPrimary },
};

