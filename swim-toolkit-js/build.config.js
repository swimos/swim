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
    id: "interpolate",
    name: "@swim/interpolate",
    path: "../swim-system-js/swim-core-js/@swim/interpolate",
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
    path: "../swim-system-js/swim-core-js/@swim/structure",
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
    path: "../swim-system-js/swim-core-js/@swim/math",
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
    path: "../swim-system-js/swim-core-js/@swim/time",
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
    path: "../swim-system-js/swim-core-js/@swim/uri",
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
    path: "../swim-system-js/swim-core-js/@swim/core",
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

const mesh = [
  {
    id: "warp",
    name: "@swim/warp",
    path: "../swim-system-js/swim-mesh-js/@swim/warp",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "recon", "uri"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "recon", "uri", "warp"],
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
        deps: ["util", "codec", "collections", "interpolate", "structure", "streamlet", "dataflow", "recon", "uri", "warp"],
      },
      {
        id: "test",
        deps: ["util", "codec", "collections", "unit", "interpolate", "structure", "streamlet", "dataflow", "recon", "uri", "warp", "client"],
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
        deps: ["util", "codec", "args", "collections", "interpolate", "structure", "streamlet", "dataflow", "recon", "uri", "warp", "client"],
      },
    ],
  },
  {
    id: "mesh",
    name: "@swim/mesh",
    path: "../swim-system-js/swim-mesh-js/@swim/mesh",
    title: "Swim Mesh Framework",
    umbrella: true,
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
    title: "Swim System Framework",
    umbrella: true,
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
    id: "angle",
    name: "@swim/angle",
    path: "swim-ui-js/@swim/angle",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "angle"],
      },
    ],
  },
  {
    id: "length",
    name: "@swim/length",
    path: "swim-ui-js/@swim/length",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "length"],
      },
    ],
  },
  {
    id: "color",
    name: "@swim/color",
    path: "swim-ui-js/@swim/color",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "angle"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "angle", "color"],
      },
    ],
  },
  {
    id: "font",
    name: "@swim/font",
    path: "swim-ui-js/@swim/font",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "length"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "length", "font"],
      },
    ],
  },
  {
    id: "shadow",
    name: "@swim/shadow",
    path: "swim-ui-js/@swim/shadow",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "length", "color"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "length", "color", "shadow"],
      },
    ],
  },
  {
    id: "gradient",
    name: "@swim/gradient",
    path: "swim-ui-js/@swim/gradient",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "length", "color"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "length", "color", "gradient"],
      },
    ],
  },
  {
    id: "transform",
    name: "@swim/transform",
    path: "swim-ui-js/@swim/transform",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "angle", "length"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "math", "angle", "length", "transform"],
      },
    ],
  },
  {
    id: "scale",
    name: "@swim/scale",
    path: "swim-ui-js/@swim/scale",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "transform"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "math", "time", "angle", "length", "color", "transform", "scale"],
      },
    ],
  },
  {
    id: "transition",
    name: "@swim/transition",
    path: "swim-ui-js/@swim/transition",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "transform"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "math", "time", "angle", "length", "color", "transform", "transition"],
      },
    ],
  },
  {
    id: "animate",
    name: "@swim/animate",
    path: "swim-ui-js/@swim/animate",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "transform", "transition"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style"],
      },
    ],
  },
  {
    id: "render",
    name: "@swim/render",
    path: "swim-ui-js/@swim/render",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style"],
      },
    ],
  },
  {
    id: "constraint",
    name: "@swim/constraint",
    path: "swim-ui-js/@swim/constraint",
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
    id: "view",
    name: "@swim/view",
    path: "swim-ui-js/@swim/view",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom"],
      },
    ],
  },
  {
    id: "gesture",
    name: "@swim/gesture",
    path: "swim-ui-js/@swim/gesture",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view"],
      },
    ],
  },
  {
    id: "ui",
    name: "@swim/ui",
    path: "swim-ui-js/@swim/ui",
    title: "Swim User Interface Toolkit",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "gesture"],
      },
    ],
  },
];

const ux = [
  {
    id: "theme",
    name: "@swim/theme",
    path: "swim-ux-js/@swim/theme",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics"],
      },
      {
        id: "test",
        deps: ["util", "codec", "unit", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "theme"],
      },
    ],
  },
  {
    id: "modal",
    name: "@swim/modal",
    path: "swim-ux-js/@swim/modal",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "theme"],
      },
    ],
  },
  {
    id: "button",
    name: "@swim/button",
    path: "swim-ux-js/@swim/button",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "gesture", "theme", "modal"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "gesture", "theme", "modal", "button"],
      },
    ],
  },
  {
    id: "drawer",
    name: "@swim/drawer",
    path: "swim-ux-js/@swim/drawer",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "gesture", "theme", "modal", "button"],
      },
    ],
  },
  {
    id: "menu",
    name: "@swim/menu",
    path: "swim-ux-js/@swim/menu",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "gesture", "theme", "modal", "button"],
      },
    ],
  },
  {
    id: "tree",
    name: "@swim/tree",
    path: "swim-ux-js/@swim/tree",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "gesture", "theme", "modal", "button"],
      },
    ],
  },
  {
    id: "ux",
    name: "@swim/ux",
    path: "swim-ux-js/@swim/ux",
    title: "Swim User Experience Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["theme", "modal", "button", "token", "drawer", "menu", "tree"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics"],
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
        deps: ["util", "codec", "collections", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "gesture"],
      },
    ],
  },
  {
    id: "vis",
    name: "@swim/vis",
    path: "swim-vis-js/@swim/vis",
    title: "Swim Visualizations Framework",
    umbrella: true,
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "map"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "map"],
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
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "map"],
      },
    ],
  },
  {
    id: "maps",
    name: "@swim/maps",
    path: "swim-maps-js/@swim/maps",
    title: "Swim Maps Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["map", "mapbox", "googlemap", "esrimap"],
      },
    ],
  },
];

const mvc = [
  {
    id: "model",
    name: "@swim/model",
    path: "swim-mvc-js/@swim/model",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "collections", "interpolate", "structure", "streamlet", "dataflow", "recon", "uri", "warp", "client"],
      },
    ],
  },
  {
    id: "component",
    name: "@swim/component",
    path: "swim-mvc-js/@swim/component",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "collections", "interpolate", "structure", "streamlet", "dataflow", "recon", "math", "time", "uri", "warp", "client", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "model"],
      },
    ],
  },
  {
    id: "mvc",
    name: "@swim/mvc",
    path: "swim-mvc-js/@swim/mvc",
    title: "Swim MVC Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["model", "component"],
      },
    ],
  },
];

const web = [
  {
    id: "website",
    name: "@swim/website",
    path: "swim-web-js/@swim/website",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom", "graphics", "theme", "modal"],
      },
    ],
  },
  {
    id: "webapp",
    name: "@swim/webapp",
    path: "swim-web-js/@swim/webapp",
    targets: [
      {
        id: "main",
        deps: ["util", "codec", "interpolate", "structure", "math", "time", "angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom"],
      },
    ],
  },
  {
    id: "web",
    name: "@swim/web",
    path: "swim-web-js/@swim/web",
    title: "Swim Web Application Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["website", "webapp"],
      },
    ],
  },
];

const toolkit = [
  {
    id: "toolkit",
    name: "@swim/toolkit",
    title: "Swim Toolkit",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["core", "mesh", "ui", "ux", "vis", "maps", "mvc", "web"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: core.concat(mesh).concat(system).concat(ui).concat(ux).concat(vis).concat(maps).concat(mvc).concat(web).concat(toolkit),
  gaID: "UA-79441805-2",
};
