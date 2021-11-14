import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const mainEsm = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-ui.mjs",
    format: "esm",
    paths: {
      "@swim/util": "@swim/core",
      "@swim/codec": "@swim/core",
      "@swim/fastener": "@swim/core",
      "@swim/collections": "@swim/core",
      "@swim/constraint": "@swim/core",
      "@swim/structure": "@swim/core",
      "@swim/streamlet": "@swim/core",
      "@swim/dataflow": "@swim/core",
      "@swim/recon": "@swim/core",
      "@swim/uri": "@swim/core",
      "@swim/math": "@swim/core",
      "@swim/time": "@swim/core",
      "@swim/warp": "@swim/host",
      "@swim/client": "@swim/host",
    },
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/fastener",
    "@swim/collections",
    "@swim/constraint",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/uri",
    "@swim/math",
    "@swim/time",
    "@swim/core",
    "@swim/warp",
    "@swim/client",
    "@swim/host",
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
    file: "./dist/swim-ui.js",
    name: "swim",
    format: "umd",
    globals: {
      "@swim/util": "swim",
      "@swim/codec": "swim",
      "@swim/fastener": "swim",
      "@swim/collections": "swim",
      "@swim/constraint": "swim",
      "@swim/structure": "swim",
      "@swim/streamlet": "swim",
      "@swim/dataflow": "swim",
      "@swim/recon": "swim",
      "@swim/uri": "swim",
      "@swim/math": "swim",
      "@swim/time": "swim",
      "@swim/core": "swim",
      "@swim/warp": "swim",
      "@swim/client": "swim",
      "@swim/host": "swim",
    },
    paths: {
      "@swim/util": "@swim/core",
      "@swim/codec": "@swim/core",
      "@swim/fastener": "@swim/core",
      "@swim/collections": "@swim/core",
      "@swim/constraint": "@swim/core",
      "@swim/structure": "@swim/core",
      "@swim/streamlet": "@swim/core",
      "@swim/dataflow": "@swim/core",
      "@swim/recon": "@swim/core",
      "@swim/uri": "@swim/core",
      "@swim/math": "@swim/core",
      "@swim/time": "@swim/core",
      "@swim/warp": "@swim/host",
      "@swim/client": "@swim/host",
    },
    sourcemap: true,
    interop: "esModule",
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/fastener",
    "@swim/collections",
    "@swim/constraint",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/uri",
    "@swim/math",
    "@swim/time",
    "@swim/core",
    "@swim/warp",
    "@swim/client",
    "@swim/host",
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

const targets = [mainEsm, mainUmd];
targets.main = [mainEsm, mainUmd];
export default targets;
