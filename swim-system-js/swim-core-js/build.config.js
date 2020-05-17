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
    id: "interpolate",
    name: "@swim/interpolate",
    targets: [
      {
        id: "main",
        deps: ["util"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate"],
      },
    ],
  },
  {
    id: "structure",
    name: "@swim/structure",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure"],
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
        deps: ["util", "codec", "collections", "interpolate", "structure", "streamlet"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "collections", "interpolate", "structure", "streamlet", "dataflow"],
      },
    ],
  },
  {
    id: "recon",
    name: "@swim/recon",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "recon"],
      },
    ],
  },
  {
    id: "math",
    name: "@swim/math",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "math"],
      },
    ],
  },
  {
    id: "time",
    name: "@swim/time",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "time"],
      },
    ],
  },
  {
    id: "uri",
    name: "@swim/uri",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "uri"],
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
        deps: ["util", "codec", "collections", "interpolate", "structure", "streamlet", "dataflow", "recon", "math", "time", "uri"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: core,
};
