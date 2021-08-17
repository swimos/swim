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
    id: "leaflet",
    name: "@swim/leaflet",
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
    title: "Swim Maps",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["map", "mapbox", "leaflet", "googlemap", "esrimap"],
      },
    ],
  },
];

export default {
  version: "3.11.1",
  projects: maps,
};
