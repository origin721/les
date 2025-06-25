import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import postcssCustomMedia from "postcss-custom-media";

export default {
  plugins: [tailwindcss, autoprefixer, postcssCustomMedia()],
};
