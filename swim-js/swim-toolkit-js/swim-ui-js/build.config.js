const ui = [
  {
    id: "model",
    name: "@swim/model",
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
      },
      {
        id: "test",
        deps: ["style"],
      },
    ],
  },
  {
    id: "theme",
    name: "@swim/theme",
    targets: [
      {
        id: "main",
        deps: ["style"],
      },
      {
        id: "test",
        deps: ["style", "theme"],
      },
    ],
  },
  {
    id: "view",
    name: "@swim/view",
    targets: [
      {
        id: "main",
        deps: ["style", "theme"],
      },
    ],
  },
  {
    id: "dom",
    name: "@swim/dom",
    targets: [
      {
        id: "main",
        deps: ["style", "theme", "view"],
      },
    ],
  },
  {
    id: "graphics",
    name: "@swim/graphics",
    targets: [
      {
        id: "main",
        deps: ["style", "theme", "view", "dom"],
      },
    ],
  },
  {
    id: "controller",
    name: "@swim/controller",
    targets: [
      {
        id: "main",
        deps: ["model", "style", "theme", "view", "dom"],
      },
    ],
  },
  {
    id: "ui",
    name: "@swim/ui",
    title: "Swim UI",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["model", "style", "theme", "view", "dom", "graphics", "controller"],
      },
    ],
  },
];

export default {
  version: "4.0.0-dev.20210920",
  projects: ui,
};
