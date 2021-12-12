import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";
import * as pkg from "../../package.json";

const script = "swim-runtime";

const external = [
];

const globals = Object.fromEntries(external.map(name => [name, "swim"]));

const paths = {};

const beautify = terser({
  compress: false,
  mangle: false,
  output: {
    preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
    beautify: true,
    comments: false,
    indent_level: 2,
  },
});

const minify = terser({
  output: {
    preamble: `// ${pkg.name} v${pkg.version} (c) ${pkg.copyright}`,
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

export default [
  {
    input: "../../lib/main/index.js",
    output: {
      file: `../../dist/${script}.mjs`,
      format: "esm",
      paths: paths,
      freeze: false,
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      plugins: [beautify],
    },
    external: external.concat("tslib"),
    plugins: [
      shimImport("os", "export const EOL = \"\\n\""),
      shimImport("ws", "export const WebSocket = void 0"),
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
  {
    input: "../../lib/main/index.js",
    output: [
      {
        file: `../../dist/${script}.js`,
        name: "swim",
        format: "umd",
        globals: {
          ...globals,
          os: "os",
          ws: "ws",
        },
        paths: paths,
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        sourcemap: true,
        interop: "esModule",
        extend: true,
        plugins: [beautify],
      },
      {
        file: `../../dist/${script}.min.js`,
        name: "swim",
        format: "umd",
        globals: {
          ...globals,
          os: "os",
          ws: "ws",
        },
        paths: paths,
        generatedCode: {
          preset: "es2015",
          constBindings: true,
        },
        sourcemap: true,
        interop: "esModule",
        extend: true,
        plugins: [minify],
      },
    ],
    external: external.concat("os", "ws"),
    plugins: [
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "MISSING_NODE_BUILTINS") return;
      warn(warning);
    },
  },
];
