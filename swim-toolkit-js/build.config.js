const core = [
  {
    id: "util",
    name: "@swim/util",
    path: "../swim-system-js/swim-core-js/@swim/util",
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
    path: "../swim-system-js/swim-core-js/@swim/codec",
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
    path: "../swim-system-js/swim-core-js/@swim/args",
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
    path: "../swim-system-js/swim-core-js/@swim/build",
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
    path: "../swim-system-js/swim-core-js/@swim/unit",
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
    path: "../swim-system-js/swim-core-js/@swim/mapping",
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
    path: "../swim-system-js/swim-core-js/@swim/collections",
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
    path: "../swim-system-js/swim-core-js/@swim/constraint",
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
    path: "../swim-system-js/swim-core-js/@swim/structure",
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
    path: "../swim-system-js/swim-core-js/@swim/streamlet",
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
    path: "../swim-system-js/swim-core-js/@swim/dataflow",
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
    id: "recon",
    name: "@swim/recon",
    path: "../swim-system-js/swim-core-js/@swim/recon",
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
    path: "../swim-system-js/swim-core-js/@swim/macro",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "args", "mapping", "structure", "recon"],
      },
      {
        id: "test",
        deps: ["util", "codec", "args", "unit", "mapping", "structure", "recon", "macro"],
      },
    ],
  },
  {
    id: "uri",
    name: "@swim/uri",
    path: "../swim-system-js/swim-core-js/@swim/uri",
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
    path: "../swim-system-js/swim-core-js/@swim/math",
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
    path: "../swim-system-js/swim-core-js/@swim/geo",
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
    path: "../swim-system-js/swim-core-js/@swim/time",
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
    path: "../swim-system-js/swim-core-js/@swim/core",
    title: "Swim Core",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "geo", "time"],
      },
    ],
  },
];

const mesh = [
  {
    id: "warp",
    name: "@swim/warp",
    path: "../swim-system-js/swim-mesh-js/@swim/warp",
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
    path: "../swim-system-js/swim-mesh-js/@swim/client",
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
    path: "../swim-system-js/swim-mesh-js/@swim/cli",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "args", "mapping", "collections", "structure", "streamlet", "dataflow", "recon", "uri", "warp", "client"],
      },
    ],
  },
  {
    id: "mesh",
    name: "@swim/mesh",
    path: "../swim-system-js/swim-mesh-js/@swim/mesh",
    title: "Swim Mesh",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["warp", "client"],
      },
    ],
  },
];

const system = [
  {
    id: "system",
    name: "@swim/system",
    path: "../swim-system-js/@swim/system",
    title: "Swim System",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["core", "mesh"],
      },
    ],
  },
];

const ui = [
  {
    id: "model",
    name: "@swim/model",
    path: "swim-ui-js/@swim/model",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "structure", "streamlet", "dataflow", "recon", "uri", "warp", "client"],
      },
    ],
  },
  {
    id: "style",
    name: "@swim/style",
    path: "swim-ui-js/@swim/style",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure", "math", "time"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "math", "time", "style"],
      },
    ],
  },
  {
    id: "theme",
    name: "@swim/theme",
    path: "swim-ui-js/@swim/theme",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "structure", "math", "time", "style"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "mapping", "structure", "math", "time", "style", "theme"],
      },
    ],
  },
  {
    id: "view",
    name: "@swim/view",
    path: "swim-ui-js/@swim/view",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "constraint", "structure", "math", "time", "style", "theme"],
      },
    ],
  },
  {
    id: "dom",
    name: "@swim/dom",
    path: "swim-ui-js/@swim/dom",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "constraint", "structure", "math", "time", "style", "theme", "view"],
      },
    ],
  },
  {
    id: "graphics",
    name: "@swim/graphics",
    path: "swim-ui-js/@swim/graphics",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "constraint", "structure", "math", "time", "style", "theme", "view", "dom"],
      },
    ],
  },
  {
    id: "component",
    name: "@swim/component",
    path: "swim-ui-js/@swim/component",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "time", "warp", "client", "model", "style", "theme", "view", "dom"],
      },
    ],
  },
  {
    id: "ui",
    name: "@swim/ui",
    path: "swim-ui-js/@swim/ui",
    title: "Swim UI",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["model", "style", "theme", "view", "dom", "graphics", "component"],
      },
    ],
  },
];

const ux = [
  {
    id: "button",
    name: "@swim/button",
    path: "swim-ux-js/@swim/button",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "constraint", "structure", "math", "time", "style", "theme", "view", "dom", "graphics"],
      },
    ],
  },
  {
    id: "token",
    name: "@swim/token",
    path: "swim-ux-js/@swim/token",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "constraint", "structure", "math", "time", "style", "theme", "view", "dom", "graphics"],
      },
    ],
  },
  {
    id: "grid",
    name: "@swim/grid",
    path: "swim-ux-js/@swim/grid",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component", "button"],
      },
    ],
  },
  {
    id: "window",
    name: "@swim/window",
    path: "swim-ux-js/@swim/window",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "constraint", "structure", "math", "time", "style", "theme", "view", "dom", "graphics", "button"],
      },
    ],
  },
  {
    id: "deck",
    name: "@swim/deck",
    path: "swim-ux-js/@swim/deck",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "constraint", "structure", "math", "time", "style", "theme", "view", "dom", "graphics", "button"],
      },
    ],
  },
  {
    id: "ux",
    name: "@swim/ux",
    path: "swim-ux-js/@swim/ux",
    title: "Swim UX",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["button", "token", "grid", "window", "deck"],
      },
    ],
  },
];

const vis = [
  {
    id: "gauge",
    name: "@swim/gauge",
    path: "swim-vis-js/@swim/gauge",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component"],
      },
    ],
  },
  {
    id: "pie",
    name: "@swim/pie",
    path: "swim-vis-js/@swim/pie",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component"],
      },
    ],
  },
  {
    id: "chart",
    name: "@swim/chart",
    path: "swim-vis-js/@swim/chart",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component"],
      },
    ],
  },
  {
    id: "vis",
    name: "@swim/vis",
    path: "swim-vis-js/@swim/vis",
    title: "Swim Vis",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["gauge", "pie", "chart"],
      },
    ],
  },
];

const maps = [
  {
    id: "map",
    name: "@swim/map",
    path: "swim-maps-js/@swim/map",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "geo", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component"],
      },
    ],
  },
  {
    id: "mapbox",
    name: "@swim/mapbox",
    path: "swim-maps-js/@swim/mapbox",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "geo", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component", "map"],
      },
    ],
  },
  {
    id: "leaflet",
    name: "@swim/leaflet",
    path: "swim-maps-js/@swim/leaflet",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "geo", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component", "map"],
      },
    ],
  },
  {
    id: "googlemap",
    name: "@swim/googlemap",
    path: "swim-maps-js/@swim/googlemap",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "geo", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component", "map"],
      },
    ],
  },
  {
    id: "esrimap",
    name: "@swim/esrimap",
    path: "swim-maps-js/@swim/esrimap",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "mapping", "collections", "constraint", "structure", "streamlet", "dataflow", "recon", "uri", "math", "geo", "time", "warp", "client", "model", "style", "theme", "view", "dom", "graphics", "component", "map"],
      },
    ],
  },
  {
    id: "maps",
    name: "@swim/maps",
    path: "swim-maps-js/@swim/maps",
    title: "Swim Maps",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["map", "mapbox", "leaflet", "googlemap", "esrimap"],
      },
    ],
  },
];

const toolkit = [
  {
    id: "toolkit",
    name: "@swim/toolkit",
    title: "Swim Toolkit",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["ui", "ux", "vis", "maps"],
        peerDeps: ["system"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: core.concat(mesh).concat(system).concat(ui).concat(ux).concat(vis).concat(maps).concat(toolkit),
  gaID: "UA-79441805-2",
};
