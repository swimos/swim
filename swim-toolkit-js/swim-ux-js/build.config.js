const ux = [
  {
    id: "button",
    name: "@swim/button",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "token",
    name: "@swim/token",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "grid",
    name: "@swim/grid",
    targets: [
      {
        id: "main",
        deps: ["button"],
      },
    ],
  },
  {
    id: "window",
    name: "@swim/window",
    targets: [
      {
        id: "main",
        deps: ["button"],
      },
    ],
  },
  {
    id: "deck",
    name: "@swim/deck",
    targets: [
      {
        id: "main",
        deps: ["button"],
      },
    ],
  },
  {
    id: "ux",
    name: "@swim/ux",
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

export default {
  version: "3.11.1",
  projects: ux,
};
