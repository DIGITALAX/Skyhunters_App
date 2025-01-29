import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        negro: "#0A0A0A",
        gris: "#181818",
        ligero: "#454545",
        nubes: "#7f7f7f",
        cielo: "#2B7FD5",
        blanco: "#E7F3F6",
      },
    },
  },
  plugins: [],
} satisfies Config;
