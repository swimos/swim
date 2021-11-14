import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const mainEsm = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-streamlet.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/collections",
    "tslib",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const mainUmd = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-streamlet.js",
    name: "swim",
    format: "umd",
    globals: {
      "@swim/util": "swim",
      "@swim/collections": "swim",
    },
    sourcemap: true,
    interop: "esModule",
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/collections",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const testEsm = {
  input: "./lib/test/index.js",
  output: {
    file: "./dist/swim-streamlet-test.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/unit",
    "@swim/collections",
    "@swim/streamlet",
    "tslib",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const targets = [mainEsm, mainUmd, testEsm];
targets.main = [mainEsm, mainUmd];
targets.test = testEsm;
export default targets;
