import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-client";
const namespace = "swim";

const main = {
  input: "./lib/main/index.js",
  output: {
    file: `./dist/main/${script}.js`,
    name: namespace,
    format: "umd",
    globals: {
      "@swim/util": "swim",
      "@swim/codec": "swim",
      "@swim/collections": "swim",
      "@swim/structure": "swim",
      "@swim/streamlet": "swim",
      "@swim/dataflow": "swim",
      "@swim/recon": "swim",
      "@swim/uri": "swim",
      "@swim/warp": "swim",
      ws: "ws",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/collections",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/uri",
    "@swim/warp",
    "ws",
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

const test = {
  input: "./lib/test/index.js",
  output: {
    file: `./dist/test/${script}-test.js`,
    name: `${namespace}.test`,
    format: "umd",
    globals: {
      http: "http",
      ws: "ws",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "http",
    "ws",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    if (warning.code === "MISSING_NODE_BUILTINS") return;
    warn(warning);
  },
};

const targets = [main, test];
targets.main = main;
targets.test = test;
export default targets;
