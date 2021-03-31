import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-system";
const namespace = "swim";

const main = {
  input: "./lib/main/index.js",
  output: {
    file: `./dist/main/${script}.js`,
    name: namespace,
    format: "umd",
    globals: {
      ws: "ws",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "ws",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../../swim-mesh-js",
                                     "../../swim-core-js",
                                     "node_modules"]}),
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
