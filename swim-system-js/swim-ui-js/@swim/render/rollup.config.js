import nodeResolve from "rollup-plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-render";
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
      "@swim/structure": "swim",
      "@swim/math": "swim",
      "@swim/time": "swim",
      "@swim/angle": "swim",
      "@swim/length": "swim",
      "@swim/color": "swim",
      "@swim/font": "swim",
      "@swim/transform": "swim",
      "@swim/interpolate": "swim",
      "@swim/scale": "swim",
      "@swim/transition": "swim",
      "@swim/style": "swim",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/structure",
    "@swim/math",
    "@swim/time",
    "@swim/angle",
    "@swim/length",
    "@swim/color",
    "@swim/font",
    "@swim/transform",
    "@swim/interpolate",
    "@swim/scale",
    "@swim/transition",
    "@swim/style",
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
