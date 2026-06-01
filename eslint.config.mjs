import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // macOS AppleDouble metadata files created on the external (exFAT) drive.
    // They're binary, so ESLint chokes parsing them as TS. (.gitignore is not
    // consulted by ESLint's flat config, so ignore them explicitly here.)
    "**/._*",
  ]),
]);

export default eslintConfig;
