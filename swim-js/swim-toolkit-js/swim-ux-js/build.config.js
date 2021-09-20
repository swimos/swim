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
    id: "table",
    name: "@swim/table",
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
        deps: ["button", "token", "table", "window", "deck"],
      },
    ],
  },
];

export default {
  version: "4.0.0-dev.20210920",
  projects: ux,
};
