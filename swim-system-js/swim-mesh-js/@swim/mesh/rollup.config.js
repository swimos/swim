import nodeResolve from "rollup-plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-mesh";
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
      "@swim/math": "swim",
      "@swim/time": "swim",
      "@swim/uri": "swim",
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
    "@swim/math",
    "@swim/time",
    "@swim/uri",
    "ws",
  ],
  plugins: [
    nodeResolve({customResolveOptions: {paths: "../.."}}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const targets = [main];
targets.main = main;
export default targets;
