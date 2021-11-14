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
    file: "./dist/swim-client.mjs",
    format: "esm",
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
    "@swim/warp",
    "tslib",
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

const mainUmd = {
  input: "./lib/main/index.js",
  output: {
    file: "./dist/swim-client.js",
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
      "@swim/warp": "swim",
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
    "@swim/warp",
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

const cliCjs = {
  input: "./lib/cli/index.js",
  output: {
    file: "./dist/swim-client-cli.cjs",
    format: "cjs",
    sourcemap: true,
    interop: "esModule",
    banner: "#!/usr/bin/env node",
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
    "@swim/warp",
    "@swim/client",
    "tslib",
    "ws",
  ],
  plugins: [
    dynamicImportToRequire("ws"),
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
    file: "./dist/swim-client-test.mjs",
    format: "esm",
    sourcemap: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/fastener",
    "@swim/args",
    "@swim/unit",
    "@swim/collections",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/uri",
    "@swim/warp",
    "@swim/client",
    "http",
    "tslib",
    "ws",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    if (warning.code === "MISSING_NODE_BUILTINS") return;
    warn(warning);
  },
};

const targets = [mainEsm, mainUmd, cliCjs, testEsm];
targets.main = [mainEsm, mainUmd];
targets.cli = cliCjs;
targets.test = testEsm;
export default targets;
