import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
//import pkg from "../package.json" assert {type: "json"};
import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const pkg = createRequire(import.meta.url)("../package.json");

const globals = function (name) {
  if (/^@swim\//.test(name)) {
    return "swim";
  }
  return void 0;
};

export default [{
  input: "../lib/main/index.js",
  output: {
    file: "../dist/swim-build.mjs",
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
          preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
          beautify: true,
          comments: false,
          indent_level: 2,
        },
      }),
    ],
  },
  external: [
    /^@swim\//,
    "@microsoft/api-extractor",
    "child_process",
    "chokidar",
    "eslint",
    "fs",
    "path",
    "rollup",
    "rollup/loadConfigFile",
    "tslib",
    "typescript",
  ],
  plugins: [
    nodeResolve(),
    sourcemaps(),
    commonjs(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
}, {
  input: "../lib/main/index.js",
  output: {
    file: "../dist/umd/swim-build.umd.cjs",
    name: "swim",
    format: "umd",
    globals,
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
          preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
          beautify: true,
          comments: false,
          indent_level: 2,
        },
      }),
    ],
  },
  external: [
    /^@swim\//,
    "@microsoft/api-extractor",
    "child_process",
    "chokidar",
    "eslint",
    "fs",
    "path",
    "rollup",
    "rollup/loadConfigFile",
    "tslib",
    "typescript",
  ],
  plugins: [
    nodeResolve(),
    sourcemaps(),
    commonjs(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
}];
