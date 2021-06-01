const core = [
  {
    id: "util",
    name: "@swim/util",
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
    targets: [
      {
        id: "main",
        deps: ["util", "codec"],
      },
    ],
  },
  {
    id: "collections",
    name: "@swim/collections",
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
    id: "mapping",
    name: "@swim/mapping",
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
    id: "structure",
    name: "@swim/structure",
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

export default {
  version: "3.10.2",
  projects: core,
};
