import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-view";
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
      "@swim/constraint": "swim",
      "@swim/structure": "swim",
      "@swim/math": "swim",
      "@swim/time": "swim",
      "@swim/style": "swim",
      "@swim/theme": "swim",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/fastener",
    "@swim/constraint",
    "@swim/structure",
    "@swim/math",
    "@swim/time",
    "@swim/style",
    "@swim/theme",
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
