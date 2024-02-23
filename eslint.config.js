import { sheriff } from "eslint-config-sheriff";
import { defineFlatConfig } from "eslint-define-config";

/**
 * @type import("@sherifforg/types").SheriffSettings
 */
const sheriffOptions = {
  react: false,
  lodash: false,
  next: false,
  playwright: false,
  jest: false,
  vitest: false,
  // astro: false, // THIS DOESN'T DO ANYTHING!
  pathsOveriddes: {
    tsconfigLocation: [
      "./tsconfig.json",
      "./tsconfig.sw.json",
      "./tsconfig.eslint.json",
    ],
  },
};

/**
 * @type import("eslint-define-config").FlatESLintConfig[]
 */
// @ts-expect-error: null and undefined are different.
const sheriffRules = sheriff(sheriffOptions);

export default defineFlatConfig([
  ...sheriffRules,
  {
    files: ["**/*.ts"],
    rules: {
      "padding-line-between-statements": "warn",
      "@typescript-eslint/naming-convention": "off",
      "prefer-destructuring": "warn",
      "unicorn/prefer-query-selector": "warn",
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
      "operator-assignment": ["warn", "always"],
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "warn",
      "no-negated-condition": "warn",
      "unicorn/no-negated-condition": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": true, "ts-check": false },
      ],
      "import/no-unresolved": [2, { ignore: ["^virtual:"] }],
      "@typescript-eslint/prefer-function-type": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/promise-function-async": "warn",
      "@typescript-eslint/strict-boolean-expressions": "warn",
    },
  },
]);
