import sheriff from "eslint-config-sheriff";
import { defineFlatConfig } from "eslint-define-config";

function sheriffOptions(files, customTSConfigPath) {
  return {
    files: files,
    react: false,
    lodash: false,
    next: false,
    playwright: false,
    jest: false,
    vitest: true,
    customTSConfigPath: customTSConfigPath,
  };
}

export default defineFlatConfig([
  ...sheriff(sheriffOptions(["src/script.ts"], "./tsconfig.json")),
  ...sheriff(sheriffOptions(["src/sw.ts"], "./tsconfig.sw.json")),
  ...sheriff(sheriffOptions(["vite.config.ts"], "./tsconfig.eslint.json")),
  {
    files: ["**/*.ts"],
    rules: {
      "padding-line-between-statements": "off",
      "@typescript-eslint/naming-convention": "off",
      "prefer-destructuring": "off",
      "unicorn/prefer-query-selector": "off",
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
      "operator-assignment": ["off", "always"],
      "fp/no-class": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "warn",
    },
  },
]);
