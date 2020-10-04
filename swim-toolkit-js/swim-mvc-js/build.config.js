const mvc = [
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
    id: "component",
    name: "@swim/component",
    targets: [
      {
        id: "main",
        deps: ["model"],
      },
    ],
  },
  {
    id: "mvc",
    name: "@swim/mvc",
    title: "Swim MVC Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["model", "component"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: mvc,
};
