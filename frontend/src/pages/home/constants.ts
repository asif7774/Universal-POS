export const techBadges = [
  { name: "React 19", icon: "settings" },
  { name: "TypeScript 5.9", icon: "settings" },
  { name: "Tailwind CSS 4", icon: "settings" },
  { name: "Vite 7", icon: "settings" },
  { name: "Vitest", icon: "wrench" },
  { name: "ESLint 9", icon: "menu" },
] as const;

export const features = [
  {
    name: "Vite 7",
    description: "Lightning-fast build tool with optimized development experience.",
    icon: "settings",
    docs: "https://vitejs.dev/",
    borderColor: "border-t-orange-500",
  },
  {
    name: "React 19",
    description: "Latest React with modern patterns and optimizations.",
    icon: "settings",
    docs: "https://react.dev/",
    borderColor: "border-t-blue-500",
  },
  {
    name: "TypeScript 5.9",
    description: "Latest TypeScript with strict typing and modern features.",
    icon: "star",
    docs: "https://www.typescriptlang.org/",
    borderColor: "border-t-green-500",
  },
  {
    name: "Tailwind CSS 4",
    description: "Next-generation utility-first CSS with optimized setup.",
    icon: "star",
    docs: "https://tailwindcss.com/",
    borderColor: "border-t-cyan-500",
  },
  {
    name: "Vitest",
    description: "Fast unit testing framework with modern features.",
    icon: "wrench",
    docs: "https://vitest.dev/",
    borderColor: "border-t-blue-600",
  },
  {
    name: "ESLint 9",
    description: "Latest linting with React/TypeScript rules.",
    icon: "menu",
    docs: "https://eslint.org/",
    borderColor: "border-t-indigo-600",
  },
  {
    name: "Component Classes",
    description: "Pre-built Tailwind component classes for faster development.",
    icon: "settings",
    docs: "https://tailwindcss.com/docs/adding-custom-styles#using-css",
    borderColor: "border-t-purple-500",
  },
  {
    name: "Path Aliases",
    description: "Clean imports using TypeScript path mapping for better organization.",
    icon: "arrow-right",
    docs: "https://github.com/vitejs/vite/issues/88#issuecomment-762415200",
    borderColor: "border-t-green-500",
  },
];

export const COMMAND = "npx degit asif7774/vital my-app";
