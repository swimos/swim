import nodeResolve from "rollup-plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-system";
const namespace = "swim";

const main = {
  input: "./lib/main/index.js",
  output: {
    file: `./dist/main/${script}.js`,
    name: namespace,
    format: "umd",
    globals: {
      "mapbox-gl": "mapboxgl",
      ws: "ws",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "mapbox-gl",
    "ws",
  ],
  plugins: [
    nodeResolve({customResolveOptions: {paths: ["../../swim-core-js",
                                                "../../swim-mesh-js",
                                                "../../swim-ui-js",
                                                "../../swim-ux-js",
                                                "../../swim-vis-js",
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
