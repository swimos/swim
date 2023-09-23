import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import terser from "@rollup/plugin-terser";

export default {
  input: "../lib/test/index.js",
  output: {
    file: "../dist/swim-constraint-test.js",
    format: "esm",
    generatedCode: {
      preset: "es2015",
      constBindings: true,
    },
    sourcemap: true,
    plugins: [
      terser({
        compress: false,
        mangle: false,
        output: {
          beautify: true,
          comments: false,
          indent_level: 2,
        },
      }),
    ],
  },
  external: [
    /^@swim\//,
    "tslib",
  ],
  plugins: [
    nodeResolve(),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};
