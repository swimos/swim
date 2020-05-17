const ux = [
  {
    id: "theme",
    name: "@swim/theme",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "app",
    name: "@swim/app",
    targets: [
      {
        id: "main",
        deps: ["theme"],
      },
    ],
  },
  {
    id: "controls",
    name: "@swim/controls",
    targets: [
      {
        id: "main",
        deps: ["theme", "app"],
      },
    ],
  },
  {
    id: "navigation",
    name: "@swim/navigation",
    targets: [
      {
        id: "main",
        deps: ["theme", "app"],
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
        deps: ["theme", "app", "controls", "navigation"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: ux,
};
