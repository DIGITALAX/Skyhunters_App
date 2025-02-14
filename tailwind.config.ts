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
        oscuro: "#000023",
        rosa: "#DE5689",
        amarillo: "#F5EB31",
        ama: "#FFFCBD",
        noche: "#96A9B6",
        brillo: "#0000E1",
        masa: "#06B4D1"
      },
      fontFamily: {
        vcr: "Vcr",
        bit: "Bitblox",
        mana: "Manaspace",
        abad: "Abaddon",
        con: "Consolas",
        arc: "Arcadia",
        nerdS: "Nerd Semi",
        nerdC: "Nerd Con",
      },
    },
  },
  plugins: [],
} satisfies Config;
