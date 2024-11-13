/** @type {import('tailwindcss').Config} */
import daisyUIThemes from "daisyui/src/theming/themes"

module.exports = {
  content: ["./index/html ","./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'),],

  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "blue",
          secondary: "teal",
        },
        black:{
          ...daisyUIThemes["black"],
          primary:"rgb(29,155,240)",
          secondary:"rgb(24,24,24)"

        }
      },
    ],
  },

}

