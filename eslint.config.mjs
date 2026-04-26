// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import playwright from "eslint-plugin-playwright";

import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["coverage/**"] },
  ...nextConfig,
  ...nextTypescript,
  ...storybook.configs["flat/recommended"],
  {
    ...playwright.configs["flat/recommended"],
    files: ["e2e/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      "playwright/prefer-locator": "off",
    },
  },
];

export default eslintConfig;
