import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";
import * as pkg from "../../package.json";

const script = "swim-toolkit";

const external = [
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
  "@swim/warp",
  "@swim/client",
  "@swim/host",
  "@swim/runtime",
];

const vendor = [
  "leaflet",
  "mapbox-gl",
];

const vendorGlobals = {
  "leaflet": "L",
  "mapbox-gl": "mapboxgl",
};

const globals = Object.fromEntries(external.map(name => [name, "swim"]));

const paths = Object.fromEntries(external.map(name => [name, "@swim/runtime"]));

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

export default [
  {
    input: "../../lib/main/index.js",
    output: {
      file: `../../dist/${script}.mjs`,
      format: "esm",
      globals: vendorGlobals,
      paths: paths,
      generatedCode: {
        preset: "es2015",
        constBindings: true,
      },
      sourcemap: true,
      plugins: [beautify],
    },
    external: external.concat(vendor).concat("tslib"),
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
    output: [
      {
        file: `../../dist/${script}.js`,
        name: "swim",
        format: "umd",
        globals: {
          ...globals,
          ...vendorGlobals,
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
          ...vendorGlobals,
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
    external: external.concat(vendor),
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
