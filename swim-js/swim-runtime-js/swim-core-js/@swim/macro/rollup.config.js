import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

function dynamicImportToRequire(importId) {
  return {
    name: "dynamic-import-to-require",
    resolveDynamicImport(specifier) {
      if (importId === specifier || Array.isArray(importId) && importId.includes(specifier)) {
        return false;
      }
      return null;
    },
    renderDynamicImport({format, moduleId, targetModuleId}) {
      if (importId === targetModuleId || Array.isArray(importId) && importId.includes(targetModuleId)) {
        return {
          left: "((function () { if (typeof require === \"function\") { try { return Promise.resolve(require(",
          right: ")); } catch (e) { } } return Promise.reject(void 0); })())",
        };
      }
      return null;
    }
  };
}

const mainEsm = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-macro.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/structure",
    "@swim/recon",
    "fs",
    "path",
    "prismjs",
    "tslib",
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

const mainUmd = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-macro.js",
    name: "swim",
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
    interop: "esModule",
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/structure",
    "@swim/recon",
    "fs",
    "path",
    "prismjs",
  ],
  plugins: [
    dynamicImportToRequire(["fs", "path", "prismjs"]),
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
    file: "./dist/swim-macro-cli.cjs",
    format: "cjs",
    sourcemap: true,
    interop: "esModule",
    banner: "#!/usr/bin/env node",
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/unit",
    "@swim/structure",
    "@swim/recon",
    "@swim/macro",
    "fs",
    "path",
    "prismjs",
    "tslib",
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

const testCjs = {
  input: "./lib/test/index.js",
  output: {
    file: './dist/swim-macro-test.cjs',
    format: "cjs",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/unit",
    "@swim/structure",
    "@swim/recon",
    "@swim/macro",
    "fs",
    "path",
    "prismjs",
    "tslib",
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

const targets = [mainEsm, mainUmd, cliCjs, testCjs];
targets.main = [mainEsm, mainUmd];
targets.cli = cliCjs;
targets.test = testCjs;
export default targets;
