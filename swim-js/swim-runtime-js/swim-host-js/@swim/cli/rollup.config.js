import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-cli";
const namespace = "swim";

const main = {
  input: "./lib/main/index.js",
  output: {
    file: `./dist/main/${script}.js`,
    name: namespace,
    format: "umd",
    globals: {
      http: "http",
      ws: "ws",
    },
    sourcemap: true,
    interop: false,
    extend: true,
    banner: "#!/usr/bin/env node",
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
    warn(warning);
  },
};

const targets = [main];
targets.main = main;
export default targets;
