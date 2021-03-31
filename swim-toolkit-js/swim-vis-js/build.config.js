const vis = [
  {
    id: "gauge",
    name: "@swim/gauge",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "pie",
    name: "@swim/pie",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "chart",
    name: "@swim/chart",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "vis",
    name: "@swim/vis",
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

export default {
  version: "3.10.2",
  projects: vis,
};
