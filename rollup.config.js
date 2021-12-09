import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/collector_search.js",
  output: [
    {
      file: "dist/collector_search.js",
      format: "umd",
      name: "CollectorSearch",
      exports: "default",
    },
  ],
  plugins: [
    nodeResolve(),
    babel({ babelHelpers: "runtime", exclude: "**/node_modules/**" }),
    commonjs(),
  ],
};
