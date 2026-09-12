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
  ]),
  {
    rules: {
      // Every data-bearing page still loads through a client-side
      // effect. Tracked as M1 in AUDIT.md — reported, not gated.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
