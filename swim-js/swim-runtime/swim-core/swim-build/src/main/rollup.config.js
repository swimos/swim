import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";
import * as pkg from "../../package.json";

const script = "swim-build";

const external = [
  "@microsoft/api-extractor",
  "@swim/util",
  "@swim/codec",
  "@swim/component",
  "@swim/sys",
  "@swim/args",
  "@swim/unit",
  "child_process",
  "chokidar",
  "eslint",
  "fs",
  "path",
  "rollup",
  "typescript",
];

const beautify = terser({
  compress: false,
  mangle: false,
  output: {
    preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
    beautify: true,
    comments: false,
    indent_level: 2,
  },
});

export default [
  {
    input: "../../lib/main/index.js",
    output: {
      file: `../../dist/${script}.mjs`,
      format: "esm",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      plugins: [beautify],
    },
    external: external.concat("tslib"),
    plugins: [
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
  {
    input: "../../lib/main/index.js",
    output: {
      file: `../../dist/${script}.cjs`,
      format: "cjs",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      interop: "esModule",
      plugins: [beautify],
    },
    external: external.concat("tslib"),
    plugins: [
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
];
