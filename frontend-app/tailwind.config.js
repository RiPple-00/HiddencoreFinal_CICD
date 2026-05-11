/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./assets/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["NotoSansKR_400Regular"], // 기본 폰트(한글)
        "sans-bold": ["NotoSansKR_700Bold"],
        english: ["Poppins_400Regular"],
        "english-semibold": ["Poppins_600SemiBold"],
        "english-bold": ["Poppins_700Bold"],
        "english-extrabold": ["Poppins_800ExtraBold"],
      },
      colors: {
        // ══════════════════════════════════════════════════
        // 보호자 (Guardian) — Yellow / Warm
        // ══════════════════════════════════════════════════
        guardian: {
          "button-primary": "#FCC101",
          "button-secondary": "#FEF7E5",
          "bg-primary": "#FEFEFE",
          "bg-secondary": "#FEFAF2",
          "hover-primary": "#F6B308",
          "text-neutral": "#000000",
          "text-primary": "#503115",
          "text-secondary": "#F6B308",
        },

        // ══════════════════════════════════════════════════
        // 요양사 (Caregiver) — Green / Teal
        // ══════════════════════════════════════════════════
        caregiver: {
          "button-primary": "#005E53",
          "button-secondary": "#2B8780",
          "bg-primary": "#F8FAFA",
          "bg-secondary": "#F0FDFA",
          "hover-primary": "#00463E",
          "text-neutral": "#000000",
          "text-primary": "#006064",
          "text-secondary": "#949BA0",
        },

        // ══════════════════════════════════════════════════
        // 공통 (Shared) — Background / Error / Success
        // ══════════════════════════════════════════════════
        background: {
          neutral: "#FFFFFF",
        },
        error: {
          primary: "#ED584C",
          secondary: "#FEECEB",
        },
        success: {
          primary: "#34A853",
          secondary: "#E6F7ED",
        },
      },
    },
  },
  plugins: [],
};