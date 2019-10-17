const web = [
  {
    id: "website",
    name: "@swim/website",
    targets: [
      {
        id: "main",
      },
    ],
  },
  {
    id: "webapp",
    name: "@swim/webapp",
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
        deps: ["website", "webapp"],
      },
    ],
  },
];

export default {
  version: "3.10.1",
  projects: web,
};
