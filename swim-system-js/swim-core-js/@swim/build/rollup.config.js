import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-build";
const namespace = "swim";

const main = {
  input: "./lib/main/index.js",
  output: {
    file: `./dist/main/${script}.js`,
    name: namespace,
    format: "cjs",
    sourcemap: true,
    interop: false,
    extend: true,
    banner: "#!/usr/bin/env node",
  },
  external: [
    "child_process",
    "eslint",
    "fs",
    "path",
    "rollup",
    "terser",
    "tslint",
    "typedoc",
    "typedoc/dist/lib/converter/components",
    "typedoc/dist/lib/converter/converter",
    "typedoc/dist/lib/converter/context",
    "typedoc/dist/lib/models/comments",
    "typedoc/dist/lib/output/components",
    "typedoc/dist/lib/output/events",
    "typescript",
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
