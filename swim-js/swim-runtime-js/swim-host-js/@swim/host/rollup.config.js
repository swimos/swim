import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-host";
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
      "@swim/fastener": "swim",
      "@swim/collections": "swim",
      "@swim/structure": "swim",
      "@swim/streamlet": "swim",
      "@swim/dataflow": "swim",
      "@swim/recon": "swim",
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
    "@swim/fastener",
    "@swim/collections",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/uri",
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

const targets = [main];
targets.main = main;
export default targets;
