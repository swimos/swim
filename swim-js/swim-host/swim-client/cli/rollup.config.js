import * as FS from "fs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import terser from "@rollup/plugin-terser";

export default {
  input: "../lib/cli/index.js",
  output: {
    file: "../dist/swim-client-cli.js",
    format: "esm",
    generatedCode: {
      preset: "es2015",
      constBindings: true,
    },
    sourcemap: true,
    interop: "esModule",
    plugins: [
      terser({
        compress: false,
        mangle: false,
        output: {
          preamble: "#!/usr/bin/env node",
          shebang: true,
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
    {
      name: "make-executable",
      writeBundle(options, bundle) {
        let {mode} = FS.statSync(options.file);
        mode |= 0o111; // executable mode
        FS.chmodSync(options.file, mode);
      },
    },
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};
