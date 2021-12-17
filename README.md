# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> SwimOS&ensp;![version](https://img.shields.io/github/tag/swimos/swim.svg?label=version) [![license](https://img.shields.io/github/license/swimos/swim.svg?color=blue)](https://github.com/swimos/swim/blob/main/LICENSE)

[SwimOS][swimos] is a full stack application platform for building stateful
web services, streaming APIs, and real-time UIs.

- **Stateful backend:** Build web service endpoints that continue to exist
  in-between operations. For every unique URI, run a lightweight, long-lived,
  general purpose compute process, called a Web Agent. Dynamically link
  Web Agents together to continuously synchronize their state. And use
  multiplexed streaming APIs to stream real-time changes to User Agents.
- **Real-time frontend:** Create live web interfaces that continuously
  synchronize application views with real-timed shared Web Agent state.
  Dynamically stream only what's necessary to update visible views. And
  efficiently render massive amounts of rapidly changing data with a UI
  toolkit built like a game engine.
- **Vertically integrated:** Built from first principles, the backend and
  frontend runtimes have zero transitive dependencies, and occupy only a
  couple megabytes on disk. The complete backend stack runs in a single OS
  process per server. And it's been proven at scale with hundreds of millions
  of concurrently running Web Agents handling millions of messages per second
  with millisecond latency.

## Getting Started

Check out the [SwimOS tutorials](https://www.swimos.org/tutorials) to get
started building stateful web services with streaming APIs and real-time UIs.

## Documentation

Learn more about streaming web services and real-time web applications
on the [SwimOS][swimos] website.

- [Java backend SDK][backend]
- [TypeScript frontend SDK][frontend]
- [Runtime architecture][runtime]

## Contributing

Read the [Contributing Guide][contributing] to learn how to contribute to the
SwimOS project.

### Code of Conduct

Help keep SwimOS open and inclusive to all by reading and following our
[Code of Conduct][conduct].

## License

Licensed under the [Apache 2.0 License][license].

[swimos]: https://www.swimos.org
[backend]: https://www.swimos.org/start/#java-server
[frontend]: https://www.swimos.org/start/#web-ui
[runtime]: https://www.swimos.org/start/#java-server
[contributing]: CONTRIBUTING.md
[conduct]: CODE_OF_CONDUCT.md
[license]: LICENSE
