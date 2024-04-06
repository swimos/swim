const core = [
  {
    id: "util",
    name: "@swim/util",
    path: "swim-core-js/@swim/util",
    targets: [
      {
        id: "main",
      },
      {
        id: "test",
        deps: ["util", "codec", "unit"],
      },
    ],
  },
  {
    id: "codec",
    name: "@swim/codec",
    path: "swim-core-js/@swim/codec",
    targets: [
      {
        id: "main",
        deps: ["util"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit"],
      },
    ],
  },
  {
    id: "args",
    name: "@swim/args",
    path: "swim-core-js/@swim/args",
    targets: [
      {
        id: "main",
        deps: ["util", "codec"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "args"],
      },
    ],
  },
  {
    id: "build",
    name: "@swim/build",
    path: "swim-core-js/@swim/build",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "args"],
      },
    ],
  },
  {
    id: "unit",
    name: "@swim/unit",
    path: "swim-core-js/@swim/unit",
    targets: [
      {
        id: "main",
        deps: ["util", "codec"],
      },
    ],
  },
  {
    id: "mapping",
    name: "@swim/mapping",
    path: "swim-core-js/@swim/mapping",
    targets: [
      {
        id: "main",
        deps: ["util"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping"],
      },
    ],
  },
  {
    id: "collections",
    name: "@swim/collections",
    path: "swim-core-js/@swim/collections",
    targets: [
      {
        id: "main",
        deps: ["util", "codec"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "collections"],
      },
    ],
  },
  {
    id: "constraint",
    name: "@swim/constraint",
    path: "swim-core-js/@swim/constraint",
    targets: [
      {
        id: "main",
        deps: ["util", "codec"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "constraint"],
      },
    ],
  },
  {
    id: "structure",
    name: "@swim/structure",
    path: "swim-core-js/@swim/structure",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure"],
      },
    ],
  },
  {
    id: "streamlet",
    name: "@swim/streamlet",
    path: "swim-core-js/@swim/streamlet",
    targets: [
      {
        id: "main",
        deps: ["util", "collections"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "collections", "streamlet"],
      },
    ],
  },
  {
    id: "dataflow",
    name: "@swim/dataflow",
    path: "swim-core-js/@swim/dataflow",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "structure", "streamlet"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "collections", "structure", "streamlet", "dataflow"],
      },
    ],
  },
  {
    id: "recon",
    name: "@swim/recon",
    path: "swim-core-js/@swim/recon",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "recon"],
      },
    ],
  },
  {
    id: "macro",
    name: "@swim/macro",
    path: "swim-core-js/@swim/macro",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure", "recon"],
      },
      {
        id: "cli",
        deps: ["util", "codec", "args", "mapping", "structure", "recon", "macro"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "recon", "macro"],
      },
    ],
  },
  {
    id: "uri",
    name: "@swim/uri",
    path: "swim-core-js/@swim/uri",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "uri"],
      },
    ],
  },
  {
    id: "math",
    name: "@swim/math",
    path: "swim-core-js/@swim/math",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "math"],
      },
    ],
  },
  {
    id: "geo",
    name: "@swim/geo",
    path: "swim-core-js/@swim/geo",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure", "math"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "math", "geo"],
      },
    ],
  },
  {
    id: "time",
    name: "@swim/time",
    path: "swim-core-js/@swim/time",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "time"],
      },
    ],
  },
  {
    id: "core",
    name: "@swim/core",
    path: "swim-core-js/@swim/core",
    title: "Swim Core",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "macro", "uri", "math", "geo", "time"],
      },
    ],
  },
];

const host = [
  {
    id: "warp",
    name: "@swim/warp",
    path: "swim-host-js/@swim/warp",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure", "recon", "uri"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "recon", "uri", "warp"],
      },
    ],
  },
  {
    id: "client",
    name: "@swim/client",
    path: "swim-host-js/@swim/client",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "structure", "streamlet", "dataflow", "recon", "uri", "warp"],
      },
      {
        id: "test",
        deps: ["util", "codec", "collections", "unit", "mapping", "structure", "streamlet", "dataflow", "recon", "uri", "warp", "client"],
      },
    ],
  },
  {
    id: "cli",
    name: "@swim/cli",
    path: "swim-host-js/@swim/cli",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "args", "mapping", "collections", "structure", "streamlet", "dataflow", "recon", "uri", "warp", "client"],
      },
    ],
  },
  {
    id: "host",
    name: "@swim/host",
    path: "swim-host-js/@swim/host",
    title: "Swim Host",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["warp", "client"],
      },
    ],
  },
];

const runtime = [
  {
    id: "runtime",
    name: "@swim/runtime",
    title: "Swim Runtime",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["core", "host"],
      },
    ],
  },
];

export default {
  version: "4.0.0-dev.20210927.3",
  projects: core.concat(host).concat(runtime),
  gaID: "UA-79441805-2",
};
