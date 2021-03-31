import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-esrimap";
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
      "@swim/mapping": "swim",
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
      "@swim/component": "swim",
      "@swim/map": "swim",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/mapping",
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
    "@swim/component",
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

const targets = [main];
targets.main = main;
export default targets;
