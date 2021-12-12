import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";
import * as pkg from "../../package.json";

const script = "swim-recon";

const external = [
  "@swim/util",
  "@swim/codec",
  "@swim/structure",
];

const globals = Object.fromEntries(external.map(name => [name, "swim"]));

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

export default [
  {
    input: "../../lib/main/index.js",
    output: {
      file: `../../dist/${script}.mjs`,
      format: "esm",
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      plugins: [beautify],
    },
    external: external.concat("tslib"),
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
    input: "../../lib/main/index.js",
    output: {
      file: `../../dist/${script}.js`,
      name: "swim",
      format: "umd",
      globals: globals,
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      interop: "esModule",
      extend: true,
      plugins: [beautify],
    },
    external: external,
    plugins: [
      nodeResolve(),
      sourcemaps(),
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
];
