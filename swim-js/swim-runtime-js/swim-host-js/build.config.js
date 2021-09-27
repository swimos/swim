const host = [
  {
    id: "warp",
    name: "@swim/warp",
    targets: [
      {
        id: "main",
      },
      {
        id: "test",
        deps: ["warp"],
      },
    ],
  },
  {
    id: "client",
    name: "@swim/client",
    targets: [
      {
        id: "main",
        deps: ["warp"],
      },
      {
        id: "test",
        deps: ["warp", "client"],
      },
    ],
  },
  {
    id: "cli",
    name: "@swim/cli",
    targets: [
      {
        id: "main",
        deps: ["warp", "client"],
      },
    ],
  },
  {
    id: "host",
    name: "@swim/host",
    title: "Swim Host",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["warp", "client"],
      },
    ],
  },
];

export default {
  version: "4.0.0-dev.20210927.1",
  projects: host,
};
