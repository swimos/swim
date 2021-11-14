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

function elideDynamicImport(importId) {
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
          left: "((function (specifier) { return Promise.reject(void 0); })(",
          right: "))",
        };
      }
      return null;
    }
  };
}

const mainEsm = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-core.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "tslib",
  ],
  plugins: [
    elideDynamicImport("os"),
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
    file: "./dist/swim-core.js",
    name: "swim",
    format: "umd",
    sourcemap: true,
    interop: "esModule",
    extend: true,
  },
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

const targets = [mainEsm, mainUmd];
targets.main = [mainEsm, mainUmd];
export default targets;
