import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const mainEsm = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-esrimap.mjs",
    format: "esm",
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
    "@swim/geo",
    "@swim/time",
    "@swim/warp",
    "@swim/client",
    "@swim/model",
    "@swim/style",
    "@swim/theme",
    "@swim/view",
    "@swim/dom",
    "@swim/graphics",
    "@swim/controller",
    "@swim/map",
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
    file: "./dist/swim-esrimap.js",
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
      "@swim/geo": "swim",
      "@swim/time": "swim",
      "@swim/warp": "swim",
      "@swim/client": "swim",
      "@swim/model": "swim",
      "@swim/style": "swim",
      "@swim/theme": "swim",
      "@swim/view": "swim",
      "@swim/dom": "swim",
      "@swim/graphics": "swim",
      "@swim/controller": "swim",
      "@swim/map": "swim",
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
    "@swim/geo",
    "@swim/time",
    "@swim/warp",
    "@swim/client",
    "@swim/model",
    "@swim/style",
    "@swim/theme",
    "@swim/view",
    "@swim/dom",
    "@swim/graphics",
    "@swim/controller",
    "@swim/map",
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
