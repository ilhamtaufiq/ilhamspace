import eslint from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import ts from "typescript-eslint";

export default ts.config(
  eslint.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  {
    ignores: [
      ".svelte-kit/**",
      "build/**",
      "node_modules/**",
      "app/**",
      "components/**",
      ".next/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);