const maps = [
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
    id: "maps",
    name: "@swim/maps",
    title: "Swim Maps Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["map", "mapbox", "googlemap", "esrimap"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: maps,
};
