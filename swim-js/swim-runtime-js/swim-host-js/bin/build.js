#!/bin/sh
":" //#; exec /usr/bin/env node --max-old-space-size=8192 "$0" "$@"
require("./node_modules/@swim/build/dist/main/swim-build.js");
