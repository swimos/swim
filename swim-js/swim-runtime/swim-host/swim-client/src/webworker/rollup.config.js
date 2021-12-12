import * as FS from "fs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";
import * as pkg from "../../package.json";

const script = "swim-client";

const beautify = terser({
  compress: false,
  mangle: false,
  output: {
    preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
    beautify: true,
    comments: false,
    indent_level: 2,
  },
});

const minify = terser({
  output: {
    preamble: `// ${pkg.name}/webworker v${pkg.version} (c) ${pkg.copyright}`,
    comments: false,
  },
});

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
    input: "../../lib/webworker/index.js",
    output: [
      {
        file: `../../lib/webworker/webworker.mjs`,
        format: "iife",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        sourcemap: "inline",
        interop: "esModule",
        plugins: [
          beautify,
          exportAsString(),
        ],
      },
      {
        file: `../../lib/webworker/webworker.min.mjs`,
        format: "iife",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        interop: "esModule",
        plugins: [
          minify,
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
    input: `../../lib/webworker/webworker.mjs`,
    output: [
      {
        file: `../../dist/${script}-webworker.mjs`,
        format: "esm",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        plugins: [beautify],
      },
      {
        file: `../../dist/${script}-webworker.js`,
        name: "swim.WarpWorkerHost.webworker",
        format: "umd",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        interop: "esModule",
        extend: true,
        plugins: [beautify],
      },
    ],
    plugins: [
      copyFile("index.d.ts", `../../dist/${script}-webworker.d.ts`),
    ],
  },
  {
    input: `../../lib/webworker/webworker.min.mjs`,
    output: [
      {
        file: `../../dist/${script}-webworker.min.mjs`,
        format: "esm",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        plugins: [minify],
      },
      {
        file: `../../dist/${script}-webworker.min.js`,
        name: "swim.WarpWorkerHost.webworker",
        format: "umd",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        interop: "esModule",
        extend: true,
        plugins: [minify],
      },
    ],
  },
];
