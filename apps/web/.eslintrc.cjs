/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@repo/eslint-config/index.js",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react-hooks"],
  rules: {
    // v7 introduced this rule but it flags valid setState-in-effect patterns
    "react-hooks/set-state-in-effect": "off",
  },
};
