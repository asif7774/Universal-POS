// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "*.config.mjs", "*.config.js", "*.config.ts", "src/**/*.spec.ts", "src/**/*.test.ts"],
  },
  {
    files: ["src/**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // NestJS uses decorators heavily — don't flag decorator patterns
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // Match tsconfig noImplicitAny: false — warn but don't block
      "@typescript-eslint/no-explicit-any": "warn",

      // Unused vars — allow _ prefix for intentional ignores
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Promises
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      // NestJS constructors often have params typed as interfaces
      "@typescript-eslint/no-extraneous-class": "off",

      // Empty functions common in NestJS lifecycle hooks
      "@typescript-eslint/no-empty-function": "warn",
    },
  }
);
