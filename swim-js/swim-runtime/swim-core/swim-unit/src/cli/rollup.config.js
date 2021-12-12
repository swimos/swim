import * as FS from "fs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";

const script = "swim-unit";

const external = [
  "@swim/util",
  "@swim/codec",
  "@swim/args",
  "@swim/unit",
];

const beautify = terser({
  compress: false,
  mangle: false,
  output: {
    preamble: "#!/usr/bin/env node",
    shebang: true,
    beautify: true,
    comments: false,
    indent_level: 2,
  },
});

function makeExecutable() {
  return {
    name: "make-executable",
    writeBundle(options, bundle) {
      let {mode} = FS.statSync(options.file);
      mode |= 0o111; // executable mode
      FS.chmodSync(options.file, mode);
    },
  };
}

export default {
  input: "../../lib/cli/index.js",
  output: {
    file: `../../dist/${script}-cli.mjs`,
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
    makeExecutable(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};
