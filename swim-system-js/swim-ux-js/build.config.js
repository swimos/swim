const ux = [
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
    id: "map",
    name: "@swim/map",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "mapbox",
    name: "@swim/mapbox",
    targets: [
      {
        id: "main",
        deps: ["map"],
      },
    ],
  },
  {
    id: "googlemap",
    name: "@swim/googlemap",
    targets: [
      {
        id: "main",
        deps: ["map"],
      },
    ],
  },
  {
    id: "esrimap",
    name: "@swim/esrimap",
    targets: [
      {
        id: "main",
        deps: ["map"],
      },
    ],
  },
  {
    id: "ux",
    name: "@swim/ux",
    title: "Swim UI Widgets",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["gauge", "pie", "chart", "map", "mapbox", "googlemap", "esrimap"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: ux,
};
