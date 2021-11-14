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
    file: "./dist/swim-host.mjs",
    format: "esm",
    paths: {
      "@swim/util": "@swim/core",
      "@swim/codec": "@swim/core",
      "@swim/fastener": "@swim/core",
      "@swim/collections": "@swim/core",
      "@swim/structure": "@swim/core",
      "@swim/streamlet": "@swim/core",
      "@swim/dataflow": "@swim/core",
      "@swim/recon": "@swim/core",
      "@swim/uri": "@swim/core",
    },
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/fastener",
    "@swim/collections",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/uri",
    "@swim/core",
    "tslib",
    "ws",
  ],
  plugins: [
    elideDynamicImport("ws"),
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
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
    file: "./dist/swim-host.js",
    name: "swim",
    format: "umd",
    globals: {
      "@swim/util": "swim",
      "@swim/codec": "swim",
      "@swim/fastener": "swim",
      "@swim/collections": "swim",
      "@swim/structure": "swim",
      "@swim/streamlet": "swim",
      "@swim/dataflow": "swim",
      "@swim/recon": "swim",
      "@swim/uri": "swim",
      "@swim/core": "swim",
    },
    paths: {
      "@swim/util": "@swim/core",
      "@swim/codec": "@swim/core",
      "@swim/fastener": "@swim/core",
      "@swim/collections": "@swim/core",
      "@swim/structure": "@swim/core",
      "@swim/streamlet": "@swim/core",
      "@swim/dataflow": "@swim/core",
      "@swim/recon": "@swim/core",
      "@swim/uri": "@swim/core",
    },
    sourcemap: true,
    interop: "esModule",
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/fastener",
    "@swim/collections",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/uri",
    "@swim/core",
  ],
  plugins: [
    dynamicImportToRequire("ws"),
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
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
