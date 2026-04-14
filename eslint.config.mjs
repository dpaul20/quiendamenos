// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["coverage/**"] },
  ...nextConfig,
  ...nextTypescript,
  ...storybook.configs["flat/recommended"]
];

export default eslintConfig;
