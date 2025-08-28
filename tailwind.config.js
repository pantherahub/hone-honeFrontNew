const screens = require("tailwindcss/defaultTheme").screens;
const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        ...screens,
        // "2xl": "1320px",
      },
    },
    colors: {
      ...colors,
      black: "#1B1B1B",
      // primary: "#1E40AF",
      // secondary: "#9333EA",
      gray: {
        0: "#FFFFFF",
				50: "#F9FAFB",
				100: "#F3F4F6",
				200: "#E5E7EB",
				300: "#D1D5DB",
				400: "#9CA3AF",
				500: "#6B7280",
				600: "#4B5563",
				700: "#374151",
				800: "#1F2A37",
				900: "#111928",
				950: "#090D14",
      },
      red: {
				50: "#FEF3F2",
				100: "#FDE5E3",
				200: "#FCD0CC",
				300: "#F9AEA8",
				400: "#F38076",
				500: "#E85144",
				600: "#D53A2D",
				700: "#B32D22",
				800: "#942920",
				900: "#7B2821",
				950: "#43100C",
      },
      blue: {
				50: "#EFF9FF",
				100: "#DAF2FF",
				200: "#BEE8FF",
				300: "#91DBFF",
				400: "#5EC5FC",
				500: "#38A8F9",
				600: "#228CEE",
				700: "#1A73D9",
				800: "#1C5DB1",
				900: "#1C508C",
				950: "#163255",
      },
      green: {
				50: "#EEFFF5",
				100: "#D7FFEA",
				200: "#B2FFD5",
				300: "#77FEB5",
				400: "#35F38D",
				500: "#0AD167",
				600: "#02B757",
				700: "#068F47",
				800: "#0B703B",
				900: "#0B5C33",
				950: "#00341A",
      },
      yellow: {
				50: "#FEFDE8",
				100: "#FFFBC2",
				200: "#FFF488",
				300: "#FFE745",
				400: "#FDD30F",
				500: "#EDBB05",
				600: "#CD9001",
				700: "#A36605",
				800: "#87500C",
				900: "#724111",
				950: "#432205",
      },
      blue1h: {
				50: "#F3F4FB",
				100: "#E3E6F6",
				200: "#CED4EF",
				300: "#ACB7E4",
				400: "#8594D5",
				500: "#6773CA",
				600: "#545ABC",
				700: "#4949AC",
				800: "#42408D",
				900: "#2F2F5F",
				950: "#262546",
      },
      blue2h: {
				50: "#F2FBFA",
				100: "#D4F3EF",
				200: "#A9E6E0",
				300: "#76D2CD",
				400: "#5DBFBC",
				500: "#309C9A",
				600: "#247D7D",
				700: "#216364",
				800: "#1E4F51",
				900: "#1D4344",
				950: "#0B2628",
      },
      blue3h: {
				50: "#F2F9FD",
				100: "#E3F0FB",
				200: "#C1E3F6",
				300: "#8BCCEE",
				400: "#39A9E0",
				500: "#2698D1",
				600: "#177AB2",
				700: "#146190",
				800: "#155377",
				900: "#174563",
				950: "#0F2D42",
      },
    },
    extend: {
      screens: {
        xs: "380px",
        // sm: "576px",
      },
      colors: {
        main: {
          blue1h: "#2F2F5F",
          blue2h: "#5DBFBC",
          blue3h: "#39A9E0",
          yellow: "#FDD30F",
          green: "#0AD167",
          red: "#E85144",
          blue: "#1A73D9",
        }
      },
    },
  },
  plugins: [
    plugin(({ addBase, theme }) => {
      const colors = theme("colors");

      const cssVars = Object.entries(colors).reduce((acc, [key, value]) => {
        if (typeof value === "string") {
          acc[`--color-${key}`] = value;
        } else {
          Object.entries(value).forEach(([shade, hex]) => {
            acc[`--color-${key}-${shade}`] = hex;
          });
        }
        return acc;
      }, {});

      addBase({ ":root": cssVars });
    }),
    require("flowbite/plugin"),
  ],
}

