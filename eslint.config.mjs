import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", ".local-postgres/**", "node_modules/**", "public/**", "src/db/migrations/**"]),
]);
