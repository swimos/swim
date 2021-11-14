import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const mainEsm = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-warp.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/structure",
    "@swim/recon",
    "@swim/uri",
    "tslib",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
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
    file: "./dist/swim-warp.js",
    name: "swim",
    format: "umd",
    globals: {
      "@swim/util": "swim",
      "@swim/codec": "swim",
      "@swim/structure": "swim",
      "@swim/recon": "swim",
      "@swim/uri": "swim",
    },
    sourcemap: true,
    interop: "esModule",
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/structure",
    "@swim/recon",
    "@swim/uri",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
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
    file: "./dist/swim-warp-test.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/unit",
    "@swim/structure",
    "@swim/recon",
    "@swim/uri",
    "@swim/warp",
    "tslib",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
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
