import nodeResolve from "rollup-plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-animate";
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
      "@swim/math": "swim",
      "@swim/time": "swim",
      "@swim/angle": "swim",
      "@swim/length": "swim",
      "@swim/transform": "swim",
      "@swim/color": "swim",
      "@swim/interpolate": "swim",
      "@swim/transition": "swim",
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
    "@swim/math",
    "@swim/time",
    "@swim/angle",
    "@swim/length",
    "@swim/transform",
    "@swim/color",
    "@swim/interpolate",
    "@swim/transition",
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
