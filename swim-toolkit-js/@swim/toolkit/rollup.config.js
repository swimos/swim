import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-toolkit";
const namespace = "swim";

const main = {
  input: "./lib/main/index.js",
  output: {
    file: `./dist/main/${script}.js`,
    name: namespace,
    format: "umd",
    globals: {
      "mapbox-gl": "mapboxgl",
      "@swim/util": "swim",
      "@swim/codec": "swim",
      "@swim/collections": "swim",
      "@swim/interpolate": "swim",
      "@swim/structure": "swim",
      "@swim/streamlet": "swim",
      "@swim/dataflow": "swim",
      "@swim/recon": "swim",
      "@swim/math": "swim",
      "@swim/time": "swim",
      "@swim/uri": "swim",
      "@swim/warp": "swim",
      "@swim/client": "swim",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "mapbox-gl",
    "@swim/util",
    "@swim/codec",
    "@swim/collections",
    "@swim/interpolate",
    "@swim/structure",
    "@swim/streamlet",
    "@swim/dataflow",
    "@swim/recon",
    "@swim/math",
    "@swim/time",
    "@swim/uri",
    "@swim/warp",
    "@swim/client",
  ],
  plugins: [
    nodeResolve({customResolveOptions: {paths: ["../../swim-ui-js",
                                                "../../swim-ux-js",
                                                "../../swim-vis-js",
                                                "../../swim-maps-js",
                                                "../../swim-mvc-js",
                                                "../../swim-web-js"]}}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const targets = [main];
targets.main = main;
export default targets;
