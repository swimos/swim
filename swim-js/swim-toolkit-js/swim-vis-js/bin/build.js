#!/bin/sh
":" //#; exec /usr/bin/env node --max-old-space-size=16384 "$0" "$@"
require("./node_modules/@swim/build/dist/swim-build-cli.cjs");
