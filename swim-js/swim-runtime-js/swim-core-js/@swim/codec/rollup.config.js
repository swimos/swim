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
    file: "./dist/swim-codec.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
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
    file: "./dist/swim-codec.js",
    name: "swim",
    format: "umd",
    globals: {
      "@swim/util": "swim",
    },
    sourcemap: true,
    interop: "esModule",
    extend: true,
  },
  external: [
    "@swim/util",
  ],
  plugins: [
    dynamicImportToRequire("os"),
    nodeResolve({moduleDirectories: ["../..", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const testEsm = {
  input: "./lib/test/index.js",
  output: {
    file: "./dist/swim-codec-test.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/args",
    "@swim/unit",
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

const targets = [mainEsm, mainUmd];
targets.main = [mainEsm, mainUmd];
targets.test = testEsm;
export default targets;
