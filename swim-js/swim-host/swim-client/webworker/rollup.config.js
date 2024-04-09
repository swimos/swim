import * as FS from "fs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import terser from "@rollup/plugin-terser";
//import pkg from "../package.json" assert {type: "json"};
import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const pkg = createRequire(import.meta.url)("../package.json");

const globals = function (name) {
  if (/^@swim\//.test(name)) {
    return "swim";
  }
  return void 0;
};

function shimImport(importId, code) {
  if (code === void 0) {
    code = "export default void 0";
  }
  return {
    name: "shim-import",
    resolveId(source, importer, options) {
      if (source === importId) {
        return {
          id: source,
          external: false,
          moduleSideEffects: false,
        };
      }
      return null;
    },
    load(id) {
      if (id === importId) {
        return {
          code: code,
          map: { mappings: "" },
        };
      }
      return null;
    },
  };
}

function exportAsString(exportExpr) {
  if (exportExpr === void 0) {
    exportExpr = "export default";
  }
  return {
    name: "export-as-string",
    renderChunk(code, chunk, options) {
      return {
        code: `${exportExpr} ${JSON.stringify(code)};`,
        map: null,
      };
    },
  };
}

function copyFile(srcFile, dstFile) {
  return {
    name: "copy-file",
    writeBundle(options, bundle) {
      FS.copyFileSync(srcFile, dstFile);
    },
  };
}

export default [
  {
    input: "../lib/webworker/index.js",
    output: [
      {
        file: "../lib/webworker/webworker.js",
        format: "iife",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        sourcemap: "inline",
        interop: "esModule",
        plugins: [
          terser({
            compress: false,
            mangle: false,
            output: {
              preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
              beautify: true,
              comments: false,
              indent_level: 2,
            },
          }),
          exportAsString(),
        ],
      },
      {
        file: "../lib/webworker/webworker.min.js",
        format: "iife",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        interop: "esModule",
        plugins: [
          terser({
            output: {
              preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
              comments: false,
            },
          }),
          exportAsString(),
        ],
      },
    ],
    plugins: [
      shimImport("os", "export const EOL = \"\\n\""),
      shimImport("ws", "export const WebSocket = void 0"),
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "MISSING_NODE_BUILTINS") return;
      warn(warning);
    },
  },
  {
    input: "../lib/webworker/webworker.js",
    output: {
      file: "../dist/swim-client-webworker.mjs",
      format: "esm",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      plugins: [
        terser({
          compress: false,
          mangle: false,
          output: {
            preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
            beautify: true,
            comments: false,
            indent_level: 2,
          },
        }),
      ],
    },
    plugins: [
      copyFile("index.d.ts", "../dist/swim-client-webworker.d.ts"),
    ],
  },
  {
    input: "../lib/webworker/webworker.min.js",
    output: {
      file: "../dist/swim-client-webworker.min.mjs",
      format: "esm",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      plugins: [
        terser({
          output: {
            preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
            comments: false,
          },
        }),
      ],
    },
  },
  {
    input: "../lib/webworker/webworker.js",
    output: {
      file: "../dist/umd/swim-client-webworker.umd.cjs",
      format: "umd",
      name: "swim",
      globals,
      interop: "esModule",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      plugins: [
        terser({
          compress: false,
          mangle: false,
          output: {
            preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
            beautify: true,
            comments: false,
            indent_level: 2,
          },
        }),
      ],
    },
    plugins: [
      copyFile("index.d.ts", "../dist/swim-client-webworker-cjs.d.ts"),
    ],
  },
  {
    input: "../lib/webworker/webworker.min.js",
    output: {
      file: "../dist/umd/swim-client-webworker.umd.min.js",
      format: "umd",
      name: "swim",
      globals,
      interop: "esModule",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      plugins: [
        terser({
          output: {
            preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
            comments: false,
          },
        }),
      ],
    },
  },
];
