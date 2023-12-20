// @ts-check
import { sheriff } from "eslint-config-sheriff";
import { defineFlatConfig } from "eslint-define-config";

const sheriffOptions = {
  react: false,
  lodash: false,
  next: false,
  playwright: false,
  jest: false,
  vitest: false,
  pathsOveriddes: {
    tsconfigLocation: [
      "./tsconfig.json",
      "./tsconfig.sw.json",
      "./tsconfig.eslint.json",
    ],
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/dev-dist/**",
      "**/build/**",
      "**/.yarn/**",
      "**/.pnp.*",
    ],
  },
};

export default defineFlatConfig([
  ...sheriff(sheriffOptions),
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
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "warn",
      "no-negated-condition": "off",
      "unicorn/no-negated-condition": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "import/no-unresolved": [2, { ignore: ["^virtual:pwa-register$"] }],
    },
  },
]);
