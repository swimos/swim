const ux = [
  {
    id: "navigation",
    name: "@swim/navigation",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "ux",
    name: "@swim/ux",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["navigation"],
      },
    ],
  },
];

export default {
  version: "3.9.0",
  projects: ux,
};
