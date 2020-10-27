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
    id: "shadow",
    name: "@swim/shadow",
    targets: [
      {
        id: "main",
        deps: ["length", "color"],
      },
      {
        id: "test",
        deps: ["length", "color", "shadow"],
      },
    ],
  },
  {
    id: "gradient",
    name: "@swim/gradient",
    targets: [
      {
        id: "main",
        deps: ["length", "color"],
      },
      {
        id: "test",
        deps: ["length", "color", "gradient"],
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
    id: "scale",
    name: "@swim/scale",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "transform"],
      },
      {
        id: "test",
        deps: ["angle", "length", "color", "transform", "scale"],
      },
    ],
  },
  {
    id: "transition",
    name: "@swim/transition",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "transform"],
      },
      {
        id: "test",
        deps: ["angle", "length", "color", "transform", "transition"],
      },
    ],
  },
  {
    id: "animate",
    name: "@swim/animate",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "transform", "transition"],
      },
    ],
  },
  {
    id: "style",
    name: "@swim/style",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate"],
      },
      {
        id: "test",
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style"],
      },
    ],
  },
  {
    id: "render",
    name: "@swim/render",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style"],
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
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint"],
      },
    ],
  },
  {
    id: "dom",
    name: "@swim/dom",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view"],
      },
    ],
  },
  {
    id: "graphics",
    name: "@swim/graphics",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view", "dom"],
      },
    ],
  },
  {
    id: "gesture",
    name: "@swim/gesture",
    targets: [
      {
        id: "main",
        deps: ["angle", "length", "color", "font", "shadow", "gradient", "transform", "scale", "transition", "animate", "style", "render", "constraint", "view"],
      },
    ],
  },
  {
    id: "ui",
    name: "@swim/ui",
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

export default {
  version: "3.10.2",
  projects: ui,
};
