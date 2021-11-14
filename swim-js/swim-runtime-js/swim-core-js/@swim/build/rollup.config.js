import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const mainEsm = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-build.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@microsoft/api-extractor",
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "child_process",
    "eslint",
    "fs",
    "path",
    "rollup",
    "terser",
    "tslib",
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

const mainCjs = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-build.cjs",
    format: "cjs",
    sourcemap: true,
    interop: "esModule",
    extend: true,
  },
  external: [
    "@microsoft/api-extractor",
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "child_process",
    "eslint",
    "fs",
    "path",
    "rollup",
    "terser",
    "tslib",
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

const cliCjs = {
  input: "./lib/cli/index.js",
  output: {
    file: "./dist/swim-build-cli.cjs",
    format: "cjs",
    sourcemap: true,
    interop: "esModule",
    banner: "#!/usr/bin/env node",
  },
  external: [
    "@microsoft/api-extractor",
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/build",
    "child_process",
    "eslint",
    "fs",
    "path",
    "rollup",
    "terser",
    "tslib",
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

const targets = [mainEsm, mainCjs, cliCjs];
targets.main = [mainEsm, mainCjs];
targets.cli = cliCjs;
export default targets;
