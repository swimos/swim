# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim TypeScript SDK

The [Swim TypeScript SDK][frontend] contains software frameworks for consuming
multiplexed streaming APIs, and building real-time user interfaces.

- **Streaming API Client:** Web Agent client that runs in Node.js
  and browser applications.
- **UI Engine:** MVC framework for building beautifully animated,
  pervasively real-time user interfaces.
- **UX Toolkit:** UX components for structuring highly dynamic,
  continuously updating applications.
- **Data Visualizations:** Real-time gauges, pie charts, and graphs.
- **Real-Time Maps:** Continuously animated map overlays.

## Quick Start

Clone the [Swim quick start](https://github.com/swimos/swim-quick-start)
repository:

```sh
git clone https://github.com/swimos/swim-quick-start.git
```

Start the application to run the complete software stack in a local process.

```sh
cd swim-quick-start
./gradlew run
```

## Documentation

- **[Swim frontend stack][frontend]**
- [Streaming UI engine][ui]
- [Dynamic UX toolkit][ux]
- [Animated charts][vis]
- [Real-time maps][maps]

## Usage

#### npm

```sh
npm install --save @swim/runtime # for node.js projects
npm install --save @swim/toolkit # for real-time web apps
```

#### browser

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/4.x/swim-runtime.js"></script>
<script src="https://cdn.swimos.org/js/4.x/swim-toolkit.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/4.x/swim-runtime.min.js"></script>
<script src="https://cdn.swimos.org/js/4.x/swim-toolkit.min.js"></script>
```

## Contributing

Check out the [Contributing Guide][contributing] to learn how to contribute
to the Swim TypeScript SDK.

## License

Licensed under the [Apache 2.0 License][license].

[frontend]: https://www.swimos.org/frontend
[ui]: https://www.swimos.org/frontend/ui
[ux]: https://www.swimos.org/frontend/ux
[vis]: https://www.swimos.org/frontend/vis
[maps]: https://www.swimos.org/frontend/maps
[contributing]: CONTRIBUTING.md
[license]: LICENSE
