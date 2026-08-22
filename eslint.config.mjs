import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = [
  ...next,
  ...nextTs,
  prettier,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "scripts/**"] },
];

export default eslintConfig;
