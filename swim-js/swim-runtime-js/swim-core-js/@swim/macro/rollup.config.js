import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-macro";
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
      "@swim/args": "swim",
      "@swim/structure": "swim",
      "@swim/recon": "swim",
      "prismjs": "Prism",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/structure",
    "@swim/recon",
    "fs",
    "prismjs",
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

const cli = {
  input: "./lib/cli/index.js",
  output: {
    file: `./dist/cli/${script}.js`,
    name: namespace,
    format: "umd",
    globals: {
      "prismjs": "Prism",
    },
    sourcemap: true,
    interop: false,
    extend: true,
    banner: "#!/usr/bin/env node",
  },
  external: [
    "fs",
    "prismjs",
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

const test = {
  input: "./lib/test/index.js",
  output: {
    file: `./dist/test/${script}-test.js`,
    name: `${namespace}.test`,
    format: "umd",
    globals: {
      "prismjs": "Prism",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "fs",
    "prismjs",
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

const targets = [main, cli, test];
targets.main = main;
targets.cli = cli;
targets.test = test;
export default targets;
