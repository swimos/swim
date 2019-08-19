const web = [
  {
    id: "site",
    name: "@swim/site",
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
      },
    ],
  },
  {
    id: "web",
    name: "@swim/web",
    title: "Swim Web Application Framework",
    umbrella: true,
    targets: [
      {
        id: "main",
        deps: ["site", "app"],
      },
    ],
  },
];

export default {
  version: "3.10.1",
  projects: web,
};
