module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended"
  ],
  env: {
    node: true,
    es2022: true
  },
  rules: {
    "no-unused-vars": "off", // Turn off base rule as it can report incorrect errors
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  ignorePatterns: ["dist/**", "node_modules/**"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      rules: {
        "no-undef": "off" // TypeScript will handle this
      }
    }
  ]
};
