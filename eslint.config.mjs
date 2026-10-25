import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * Die Architektur-Regeln aus AGENTS.md werden hier erzwungen, nicht nur beschrieben.
 * Ausnahmen gehören in MAX_LINES_AUSNAHMEN (mit Begründung), nie als eslint-disable in den Code.
 */
const MAX_LINES = 150;

/** Dateien, die das Zeilenlimit überschreiten dürfen. Jede Ausnahme mit Grund. */
const MAX_LINES_AUSNAHMEN = [
  // Reine Text-/Übersetzungstabellen, keine Logik
  "**/texts/**/*.ts",
  "**/translations/**/*.ts",
];

export default tseslint.config(
  { ignores: ["**/dist/**", "**/coverage/**", "**/node_modules/**", "apps/client/android/**", "apps/client/ios/**", "**/.next/**", "**/out/**", "apps/web/android/**", "apps/web/ios/**", "**/next-env.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["error", { max: MAX_LINES, skipBlankLines: true, skipComments: true }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", ignoreRestSiblings: true }],
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
    },
    linterOptions: { reportUnusedDisableDirectives: "error", noInlineConfig: true },
  },
  { files: MAX_LINES_AUSNAHMEN, rules: { "max-lines": "off" } },
  {
    files: ["apps/api/**/*.ts", "packages/**/*.ts", "*.{js,mjs,ts}", "apps/web/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/client/public/**/*.js", "apps/web/public/**/*.js"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["apps/client/**/*.{ts,tsx}", "apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
);
