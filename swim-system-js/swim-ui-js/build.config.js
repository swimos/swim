const ui = [
  {
    id: "angle",
    name: "@swim/angle",
    targets: [
      {
        id: "main",
      },
      {
        id: "test",
        deps: ["angle"],
      },
    ],
  },
  {
    id: "length",
    name: "@swim/length",
    targets: [
      {
        id: "main",
      },
      {
        id: "test",
        deps: ["length"],
      },
    ],
  },
  {
    id: "color",
    name: "@swim/color",
    targets: [
      {
        id: "main",
        deps: ["angle"],
      },
      {
        id: "test",
        deps: ["angle", "color"],
      },
    ],
  },
  {
    id: "font",
    name: "@swim/font",
    targets: [
      {
        id: "main",
        deps: ["length"],
      },
      {
        id: "test",
        deps: ["length", "font"],
      },
    ],
  },
  {
    id: "transform",
    name: "@swim/transform",
    targets: [
      {
        id: "main",
        deps: ["angle", "length"],
      },
      {
        id: "test",
        deps: ["angle", "length", "transform"],
      },
    ],
  },
  {
    id: "interpolate",
    name: "@swim/interpolate",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "transform"],
      },
      {
        id: "test",
        deps: ["angle", "length", "color", "transform", "interpolate"],
      },
    ],
  },
  {
    id: "scale",
    name: "@swim/scale",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "transform", "interpolate"],
      },
      {
        id: "test",
        deps: ["angle", "length", "color", "transform", "interpolate", "scale"],
      },
    ],
  },
  {
    id: "transition",
    name: "@swim/transition",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "transform", "interpolate"],
      },
      {
        id: "test",
        deps: ["angle", "length", "color", "transform", "interpolate", "transition"],
      },
    ],
  },
  {
    id: "animate",
    name: "@swim/animate",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "transform", "interpolate", "transition"],
      },
    ],
  },
  {
    id: "dom",
    name: "@swim/dom",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "style",
    name: "@swim/style",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition"],
      },
      {
        id: "test",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition", "style"],
      },
    ],
  },
  {
    id: "render",
    name: "@swim/render",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition", "style"],
      },
    ],
  },
  {
    id: "constraint",
    name: "@swim/constraint",
    targets: [
      {
        id: "main",
      },
      {
        id: "test",
        deps: ["constraint"],
      },
    ],
  },
  {
    id: "view",
    name: "@swim/view",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition", "animate", "dom", "style", "render", "constraint"],
      },
    ],
  },
  {
    id: "shape",
    name: "@swim/shape",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition", "animate", "dom", "style", "render", "constraint", "view"],
      },
    ],
  },
  {
    id: "typeset",
    name: "@swim/typeset",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition", "animate", "dom", "style", "render", "constraint", "view"],
      },
    ],
  },
  {
    id: "gesture",
    name: "@swim/gesture",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition", "animate", "dom", "style", "render", "constraint", "view"],
      },
    ],
  },
  {
    id: "ui",
    name: "@swim/ui",
    title: "Swim UI Toolkit",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "transform", "interpolate", "scale", "transition", "animate", "dom", "style", "render", "constraint", "view", "shape", "typeset", "gesture"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: ui,
};
