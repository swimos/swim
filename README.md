# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim

[Swim][platform] is a full stack application platform for building stateful
web services, streaming APIs, and real-time UIs.

- **Stateful backend:** Build web service endpoints that continue to exist
  in-between operations. For every unique URI, run a lightweight, long-lived,
  general purpose compute process, called a Web Agent. Dynamically link
  Web Agents together to continuously synchronize their states. And use
  multiplexed streaming APIs to stream real-time changes to User Agents.
- **Real-time frontend:** Create live web interfaces that continuously
  synchronize application views with real-timed shared Web Agent states.
  Dynamically stream only what's necessary to update visible views. And
  efficiently render massive amounts of rapidly changing data with a novel
  UI toolkit built like a game engine.
- **Vertically integrated:** Built from first principles, the backend and
  frontend runtimes have zero transitive dependencies each, and occupy only
  a couple megabytes on disk. The complete backend stack runs in a single OS
  process per server. And it's been proven at scale with hundreds of millions
  of concurrently running Web Agents handling millions of messages per second,
  with millisecond latency.

## Getting Started

Install the Swim CLI globally:

```sh
npm install @swim/cli
```

Create a new project:

```sh
swim new [PROJECT NAME]
```

Run the application locally:

```sh
cd [PROJECT NAME]
swim run
```

## Documentation

Learn more about streaming web services and real-time web applications
on the [Swim](https://www.swimos.org) website.

- [Platform overview][platform]
- [Java backend SDK][backend]
- [TypeScript frontend SDK][frontend]
- [Runtime architecture][runtime]

## Contributing

Check out the [Contributing Guide][contributing] to learn how to contribute
to the Swim project.

### Code of Conduct

Help keep Swim open and inclusive to all by reading and following our
[Code of Conduct][conduct].

## License

Licensed under the [Apache 2.0 License][license].

[platform]: https://www.swimos.org/platform
[backend]: https://www.swimos.org/platform/backend
[frontend]: https://www.swimos.org/platform/frontend
[runtime]: https://www.swimos.org/platform/runtime
[contributing]: CONTRIBUTING.md
[conduct]: CODE_OF_CONDUCT.md
[license]: LICENSE
