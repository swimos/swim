const ux = [
  {
    id: "theme",
    name: "@swim/theme",
    targets: [
      {
        id: "main",
      },
      {
        id: "test",
        deps: ["theme"],
      },
    ],
  },
  {
    id: "modal",
    name: "@swim/modal",
    targets: [
      {
        id: "main",
        deps: ["theme"],
      },
    ],
  },
  {
    id: "button",
    name: "@swim/button",
    targets: [
      {
        id: "main",
        deps: ["theme", "modal"],
      },
    ],
  },
  {
    id: "token",
    name: "@swim/token",
    targets: [
      {
        id: "main",
        deps: ["theme", "modal", "button"],
      },
    ],
  },
  {
    id: "drawer",
    name: "@swim/drawer",
    targets: [
      {
        id: "main",
        deps: ["theme", "modal", "button"],
      },
    ],
  },
  {
    id: "menu",
    name: "@swim/menu",
    targets: [
      {
        id: "main",
        deps: ["theme", "modal", "button"],
      },
    ],
  },
  {
    id: "tree",
    name: "@swim/tree",
    targets: [
      {
        id: "main",
        deps: ["theme", "modal", "button"],
      },
    ],
  },
  {
    id: "ux",
    name: "@swim/ux",
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

export default {
  version: "3.10.2",
  projects: ux,
};
