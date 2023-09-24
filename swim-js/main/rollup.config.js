import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import terser from "@rollup/plugin-terser";
//import pkg from "../package.json" assert {type: "json"};
import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const pkg = createRequire(import.meta.url)("../package.json");

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

export default [
  {
    input: "../lib/main/index.js",
    output: {
      file: "../dist/swim.js",
      format: "esm",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      plugins: [
        terser({
          compress: false,
          mangle: false,
          output: {
            preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
            beautify: true,
            comments: false,
            indent_level: 2,
          },
        }),
      ],
    },
    external: [
      /^@swim\//,
      "tslib",
    ],
    plugins: [
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
  {
    input: "../lib/main/index.js",
    output: [
      {
        file: "../dist/umd/swim.js",
        name: "swim",
        format: "umd",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        sourcemap: true,
        interop: "esModule",
        extend: true,
        plugins: [
          terser({
            compress: false,
            mangle: false,
            output: {
              preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
              beautify: true,
              comments: false,
              indent_level: 2,
            },
          }),
        ],
      },
      {
        file: "../dist/umd/swim.min.js",
        name: "swim",
        format: "umd",
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        sourcemap: true,
        interop: "esModule",
        extend: true,
        plugins: [
          terser({
            output: {
              preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
              comments: false,
            },
          }),
        ],
      },
    ],
    external: [],
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
];
