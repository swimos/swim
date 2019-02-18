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
    targets: [
      {
        id: "main",
        deps: ["site", "app"],
      },
    ],
  },
];

export default {
  version: "3.9.0",
  projects: web,
};
