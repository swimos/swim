# Swim &ensp; ![version](https://img.shields.io/github/tag/swimOS/swim.svg?label=version) [![javadoc](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](http://docs.swim.ai/java/latest) [![typedoc](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest) [![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community) [![license](https://img.shields.io/github/license/swimOS/swim.svg)](https://github.com/swimos/swim/blob/master/LICENSE) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](code-of-conduct.md)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

swimOS implements a complete, self-contained, distributed application stack
in an embeddable software library. To develop server-side Swim apps, add the
[`swim-server`](https://mvnrepository.com/artifact/ai.swim/swim-server) library
to your Java project. To write a JavaScript client application, install the
[`@swim/mesh`](https://www.npmjs.com/package/@swim/mesh) library from npm.
To build a web application, npm install the [`@swim/ui`](https://www.npmjs.com/package/@swim/ui)
and [`@swim/ux`](https://www.npmjs.com/package/@swim/ux) libraries.

Visit [swim.dev](https://swim.dev) to learn more.

## Implementations

swimOS has implementations for the JVM, Node.js, and web browsers:

- [**`swim-system-java`**](swim-system-java) –
  self-contained distributed software stack for building stateful,
  massively real-time streaming applications that run on any Java 8+ VM.
- [**`swim-system-js`**](swim-system-js) –
  standalone frameworks for building massively real-time streaming user
  interfaces and client applications that run in web browsers and Node.js.

swimOS has no additional dependencies beyond the base platforms on which it runs.

### Java Implementation

The swimOS Java implementation consists of the following frameworks and libraries.

- [**`swim-core`**](swim-system-java/swim-core-java) –
  foundation framework, with lightweight concurrency, incremental I/O, and
  flow-controlled network engines.
  - [**`swim.util`**](swim-system-java/swim-core-java/swim.util) –
  - [**`swim.codec`**](swim-system-java/swim-core-java/swim.codec) –
  - [**`swim.collections`**](swim-system-java/swim-core-java/swim.collections) –
  - [**`swim.args`**](swim-system-java/swim-core-java/swim.args) –
  - [**`swim.structure`**](swim-system-java/swim-core-java/swim.structure) –
  - [**`swim.recon`**](swim-system-java/swim-core-java/swim.recon) –
  - [**`swim.json`**](swim-system-java/swim-core-java/swim.json) –
  - [**`swim.xml`**](swim-system-java/swim-core-java/swim.xml) –
  - [**`swim.protobuf`**](swim-system-java/swim-core-java/swim.protobuf) –
  - [**`swim.decipher`**](swim-system-java/swim-core-java/swim.decipher) –
  - [**`swim.math`**](swim-system-java/swim-core-java/swim.math) –
  - [**`swim.security`**](swim-system-java/swim-core-java/swim.security) –
  - [**`swim.spatial`**](swim-system-java/swim-core-java/swim.spatial) –
  - [**`swim.streamlet`**](swim-system-java/swim-core-java/swim.streamlet) –
  - [**`swim.dataflow`**](swim-system-java/swim-core-java/swim.dataflow) –
  - [**`swim.observable`**](swim-system-java/swim-core-java/swim.observable) –
  - [**`swim.uri`**](swim-system-java/swim-core-java/swim.uri) –
  - [**`swim.deflate`**](swim-system-java/swim-core-java/swim.deflate) –
  - [**`swim.mqtt`**](swim-system-java/swim-core-java/swim.mqtt) –
  - [**`swim.http`**](swim-system-java/swim-core-java/swim.http) –
  - [**`swim.ws`**](swim-system-java/swim-core-java/swim.ws) –
  - [**`swim.warp`**](swim-system-java/swim-core-java/swim.warp) –
  - [**`swim.concurrent`**](swim-system-java/swim-core-java/swim.concurrent) –
  - [**`swim.io`**](swim-system-java/swim-core-java/swim.io) –
  - [**`swim.io.mqtt`**](swim-system-java/swim-core-java/swim.io.mqtt) –
  - [**`swim.io.http`**](swim-system-java/swim-core-java/swim.io.http) –
  - [**`swim.io.ws`**](swim-system-java/swim-core-java/swim.io.ws) –
  - [**`swim.io.warp`**](swim-system-java/swim-core-java/swim.io.warp) –
  - [**`swim.web`**](swim-system-java/swim-core-java/swim.web) –
- [**`swim-mesh`**](swim-system-java/swim-mesh-java) –
  Web Agent API, and distributed microkernel implementation.
  - [**`swim.api`**](swim-system-java/swim-mesh-java/swim.api) –
  - [**`swim.store`**](swim-system-java/swim-mesh-java/swim.store) –
  - [**`swim.runtime`**](swim-system-java/swim-mesh-java/swim.runtime) –
  - [**`swim.kernel`**](swim-system-java/swim-mesh-java/swim.kernel) –
  - [**`swim.auth`**](swim-system-java/swim-mesh-java/swim.auth) –
  - [**`swim.fabric`**](swim-system-java/swim-mesh-java/swim.fabric) –
  - [**`swim.service`**](swim-system-java/swim-mesh-java/swim.service) –
  - [**`swim.store.mem`**](swim-system-java/swim-mesh-java/swim.store.mem) –
  - [**`swim.remote`**](swim-system-java/swim-mesh-java/swim.remote) –
  - [**`swim.service.web`**](swim-system-java/swim-mesh-java/swim.service.web) –
  - [**`swim.java`**](swim-system-java/swim-mesh-java/swim.java) –
  - [**`swim.server`**](swim-system-java/swim-mesh-java/swim.server) –
  - [**`swim.client`**](swim-system-java/swim-mesh-java/swim.client) –
  - [**`swim.cli`**](swim-system-java/swim-mesh-java/swim.cli) –
- [**`swim-polyglot`**](swim-system-java/swim-polyglot-java) –
  API bindings for guest languages, and [GraalVM](https://www.graalvm.org/)
  integration.
  - [**`swim.dynamic`**](swim-system-java/swim-polyglot-java/swim.dynamic) –
  - [**`swim.dynamic.java`**](swim-system-java/swim-polyglot-java/swim.dynamic.java) –
  - [**`swim.dynamic.structure`**](swim-system-java/swim-polyglot-java/swim.dynamic.structure) –
  - [**`swim.dynamic.observable`**](swim-system-java/swim-polyglot-java/swim.dynamic.observable) –
  - [**`swim.dynamic.api`**](swim-system-java/swim-polyglot-java/swim.dynamic.api) –
  - [**`swim.vm`**](swim-system-java/swim-polyglot-java/swim.vm) –
  - [**`swim.vm.js`**](swim-system-java/swim-polyglot-java/swim.vm.js) –
  - [**`swim.js`**](swim-system-java/swim-polyglot-java/swim.js) –

### TypeScript Implementation

The swimOS TypeScript implementation consists of the following frameworks and libraries.

- [**`@swim/system`**](swim-system-js/@swim/system) –
  umbrella framework that encompasses the swim-system-js child frameworks.
- [**`@swim/core`**](swim-system-js/swim-core-js) –
  lightweight, portable, dependency-free foundation framework.
  - [**`@swim/util`**](swim-system-js/swim-core-js/@swim/util) –
    ordering, equality, and hashing; type conversions; iterators; builders;
    maps; caches; and assertions.
  - [**`@swim/codec`**](swim-system-js/swim-core-js/@swim/codec) –
    incremental I/O; functional parsers and writers; display, debug, and
    diagnostic formatters; and Unicode and binary codecs.
  - [**`@swim/args`**](swim-system-js/swim-core-js/@swim/args) –
    composable command line argument parser.
  - [**`@swim/unit`**](swim-system-js/swim-core-js/@swim/unit) –
    specializable unit testing framework.
  - [**`@swim/collections`**](swim-system-js/swim-core-js/@swim/collections) –
    B-trees and S-trees (sequence trees).
  - [**`@swim/structure`**](swim-system-js/swim-core-js/@swim/structure) –
    generic structured data model, with support for selectors, expressions,
    and lambda functions.  Used as a common abstract syntax tree for Recon,
    JSON, XML, and other data languages.
  - [**`@swim/streamlet`**](swim-system-js/swim-core-js/@swim/streamlet) –
    stateful, streaming component model.
  - [**`@swim/dataflow`**](swim-system-js/swim-core-js/@swim/dataflow) –
    compiler from `@swim/structure` expressions to live-updated data models.
  - [**`@swim/recon`**](swim-system-js/swim-core-js/@swim/recon) –
    codec for parsing/writing Recon strings to/from `@swim/structure` data models.
  - [**`@swim/math`**](swim-system-js/swim-core-js/@swim/math) –
    mathematical and geometric structures and operators.
  - [**`@swim/time`**](swim-system-js/swim-core-js/@swim/time) –
    date-time, time zone, and time inteval data types, parsers, and formatters.
  - [**`@swim/uri`**](swim-system-js/swim-core-js/@swim/uri) –
    codec for parsing/writing URI strings to/from structured URI data types.
- [**`@swim/mesh`**](swim-system-js/swim-mesh-js) –
  multiplexed streaming WARP framework.
  - [**`@swim/warp`**](swim-system-js/swim-mesh-js/@swim/warp) –
    implementation of the WARP multiplexed streaming wire protocol.
  - [**`@swim/client`**](swim-system-js/swim-mesh-js/@swim/client) –
    WARP multiplexed streaming API client.
  - [**`@swim/cli`**](swim-system-js/swim-mesh-js/@swim/cli) –
    WARP command line client.
- [**`@swim/ui`**](swim-system-js/swim-ui-js) –
  real-time user interface toolkit.
  - [**`@swim/angle`**](swim-system-js/swim-ui-js/@swim/angle) –
    Dimensional angle types with unit-aware algebraic operators, conversions,
    and parsers.
  - [**`@swim/length`**](swim-system-js/swim-ui-js/@swim/length) –
    DOM-relative length types with unit-aware algebraic operators, conversions,
    and parsers.
  - [**`@swim/color`**](swim-system-js/swim-ui-js/@swim/color) –
    RGB and HSL color types with color-space-aware operators, conversions,
    and parsers.
  - [**`@swim/font`**](swim-system-js/swim-ui-js/@swim/font) –
    CSS font property types and parsers.
  - [**`@swim/transform`**](swim-system-js/swim-ui-js/@swim/transform) –
    CSS and SVG compatible transform types with unit-aware algebraic operators
    and parsers.
  - [**`@swim/interpolate`**](swim-system-js/swim-ui-js/@swim/interpolate) –
    Interpolator types for blending between values, such as numbers, dates,
    angles, lengths, colors, transforms, shapes, arrays, structures, and
    other interpolators.
  - [**`@swim/scale`**](swim-system-js/swim-ui-js/@swim/scale) –
    Scale types that map numeric and temporal input domains to interpolated
    output ranges, with support for continuous domain clamping, domain solving,
    range unscaling, and interpolation between scales.
  - [**`@swim/transition`**](swim-system-js/swim-ui-js/@swim/transition) –
    Transition types that specify duration, ease, interpolator, and lifecycle
    callback parameters for tween animations.
  - [**`@swim/animate`**](swim-system-js/swim-ui-js/@swim/animate) –
    Property-managing animator types that efficiently tween values between
    discrete state changes.
  - [**`@swim/dom`**](swim-system-js/swim-ui-js/@swim/dom) –
    CustomEvent and ResizeObserver polyfills.
  - [**`@swim/style`**](swim-system-js/swim-ui-js/@swim/style) –
    CSS style types and universal style value parser.
  - [**`@swim/render`**](swim-system-js/swim-ui-js/@swim/render) –
    Renderable graphic types for SVG and Canvas compatible path drawing contexts,
    and Canvas compatible rendering contexts.
  - [**`@swim/constraint`**](swim-system-js/swim-ui-js/@swim/constraint) –
    Incremental solver for systems of linear layout constraints.
  - [**`@swim/view`**](swim-system-js/swim-ui-js/@swim/view) –
    Unified HTML, SVG, and Canvas view hierarchy, with integrated controller
    architecture, animated procedural styling, and constraint-based layouts.
  - [**`@swim/shape`**](swim-system-js/swim-ui-js/@swim/shape) –
    Canvas shape views, with animated geometry and style properties.
  - [**`@swim/typeset`**](swim-system-js/swim-ui-js/@swim/typeset) –
    Canvas typesetting views, with animated text, layout, font, and style properties.
  - [**`@swim/gesture`**](swim-system-js/swim-ui-js/@swim/gesture) –
    Multitouch gesture recognizers, with kinematic surface modeling.
- [**`@swim/ux`**](swim-system-js/swim-ux-js) –
  real-time user interface widgets.
  - [**`@swim/gauge`**](swim-system-js/swim-ux-js/@swim/gauge) –
  - [**`@swim/pie`**](swim-system-js/swim-ux-js/@swim/pie) –
  - [**`@swim/chart`**](swim-system-js/swim-ux-js/@swim/chart) –
  - [**`@swim/map`**](swim-system-js/swim-ux-js/@swim/map) –
  - [**`@swim/mapbox`**](swim-system-js/swim-ux-js/@swim/mapbox) –
- [**`@swim/web`**](swim-system-js/swim-web-js) –
  real-time web application framework.
  - [**`@swim/site`**](swim-system-js/swim-web-js/@swim/site) –
  - [**`@swim/app`**](swim-system-js/swim-web-js/@swim/app) –

## Concepts

swimOS unifies the traditionally disparate roles of database, message broker,
job manager, and application server, into a few simple constructs: Web Agents,
Lanes, Links, and Recon.  Web Agents run like continuous, general purpose
processes on heterogeneous distributed computers, called a Fabrics.

### Web Agents
swimOS applications consist of interconnected, distributed objects, called Web
Agents.  Each Web Agent has URI address, like a REST endpoint. But unlike
RESTful Web Services, Web Agents are stateful, and accessed via streaming APIs.

### Lanes
If Web Agents are distributed objects, then lanes serve as the properties and
methods of those objects.  Lanes come in many flavors, value lanes, map lanes,
command lanes, and join lanes, to name a few.  Many lanes are internally
persistent, acting like encapsulated databas tables.

### Links
Distributed objects need a way to communicate.  Links establishes active
references to lanes of Web Agents, transparently streaming bi-directional state
changes to keep all parts of an application in sync, without the overhead of
queries or remote procedure calls.

### Recon
Communication only works if all parties understands one another.  swimOS
natively speaks a universal, structured data language, called Recon. A superset
of JSON, XML, Protocol Buffers, and more, Recon naturally translates into many
tongues.

### Fabrics
swimOS serves as the higher order operating system for distributed computers,
called Fabrics, which swimOS coherently stitches together from non-uniformly
distributed, heterogeneous sets of machines.
