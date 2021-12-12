import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";
import * as pkg from "../../package.json";

const script = "swim-mapbox";

const external = [
  "@swim/util",
  "@swim/codec",
  "@swim/component",
  "@swim/collections",
  "@swim/constraint",
  "@swim/structure",
  "@swim/streamlet",
  "@swim/dataflow",
  "@swim/recon",
  "@swim/uri",
  "@swim/math",
  "@swim/geo",
  "@swim/time",
  "@swim/warp",
  "@swim/client",
  "@swim/model",
  "@swim/style",
  "@swim/theme",
  "@swim/view",
  "@swim/dom",
  "@swim/graphics",
  "@swim/controller",
  "@swim/map",
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
      globals: {
        "mapbox-gl": "mapboxgl",
      },
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      plugins: [beautify],
    },
    external: external.concat("mapbox-gl", "tslib"),
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
      globals: {
        ...globals,
        "mapbox-gl": "mapboxgl",
      },
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      interop: "esModule",
      extend: true,
      plugins: [beautify],
    },
    external: external.concat("mapbox-gl"),
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
