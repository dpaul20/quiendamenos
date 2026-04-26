/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0], // permite mayúsculas en el subject
  },
};
