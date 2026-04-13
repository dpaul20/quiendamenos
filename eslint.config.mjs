import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["coverage/**"] },
  ...nextConfig,
  ...nextTypescript,
];

export default eslintConfig;
