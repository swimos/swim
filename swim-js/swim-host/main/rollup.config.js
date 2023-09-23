import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import terser from "@rollup/plugin-terser";
//import pkg from "../package.json" assert {type: "json"};
import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const pkg = createRequire(import.meta.url)("../package.json");

const swimCore = [
  "@swim/util",
  "@swim/codec",
  "@swim/component",
  "@swim/collections",
  "@swim/constraint",
  "@swim/structure",
  "@swim/recon",
  "@swim/uri",
  "@swim/math",
  "@swim/geo",
  "@swim/time",
  "@swim/core",
];

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
      file: "../dist/swim-host.js",
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
        file: "../dist/umd/swim-host.js",
        name: "swim",
        format: "umd",
        globals: {
          ...Object.fromEntries(swimCore.map(name => [name, "swim"])),
        },
        paths: {
          ...Object.fromEntries(swimCore.map(name => [name, "@swim/core"])),
        },
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
        file: "../dist/umd/swim-host.min.js",
        name: "swim",
        format: "umd",
        globals: {
          ...Object.fromEntries(swimCore.map(name => [name, "swim"])),
        },
        paths: {
          ...Object.fromEntries(swimCore.map(name => [name, "@swim/core"]))
        },
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
    external: [
      ...swimCore,
    ],
    plugins: [
      shimImport("ws", "export const WebSocket = void 0"),
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
];
