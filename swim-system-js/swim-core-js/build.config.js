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
    id: "structure",
    name: "@swim/structure",
    targets: [
      {
        id: "main",
        deps: ["util", "codec"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "structure"],
      },
    ],
  },
  {
    id: "recon",
    name: "@swim/recon",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "structure", "recon"],
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
        deps: ["util", "codec", "collections", "structure", "streamlet"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "collections", "structure", "streamlet", "dataflow"],
      },
    ],
  },
  {
    id: "math",
    name: "@swim/math",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "structure", "math"],
      },
    ],
  },
  {
    id: "time",
    name: "@swim/time",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "structure", "time"],
      },
    ],
  },
  {
    id: "uri",
    name: "@swim/uri",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "structure", "uri"],
      },
    ],
  },
  {
    id: "core",
    name: "@swim/core",
    title: "Swim Core Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "collections", "structure", "streamlet", "dataflow", "recon", "math", "time", "uri"],
      },
    ],
  },
];

export default {
  version: "3.9.0",
  projects: core,
};
