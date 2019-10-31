# swimOS &ensp; ![version](https://img.shields.io/github/tag/swimOS/swim.svg?label=version) [![javadoc](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest) [![typedoc](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest) [![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community) [![license](https://img.shields.io/github/license/swimOS/swim.svg)](https://github.com/swimos/swim/blob/master/LICENSE) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](code-of-conduct.md)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**swimOS** is a complete, self-contained distributed software platform for
building stateful, massively real-time streaming applications.  **swimOS**
implements a distributed microkernel, called the **Swim Kernel**, that is
persistent without a database, reactive without a message broker, autonomous
without a job manager, and which executes general purpose stateful applications
without a separate app server.

## Getting Started

Check out the [**swimOS** cookbook](https://www.swimos.org/tutorials) to learn
how to build massively real-time streaming applications.  Use the
[**Swim API**](https://mvnrepository.com/artifact/ai.swim/swim-api) to write
Web Agents that run on the **Swim Kernel**.  Use the
[**Swim Server**](https://mvnrepository.com/artifact/ai.swim/swim-server)
library to embed the **Swim Kernel** directly into an application, creating
a self-sufficient stateful distributed application plane.

To write WARP client applications that run in Node.js and web browsers,
install the [**@swim/mesh**](swim-system-js/swim-mesh-js) library from npm.
To build a real-time Web UI, npm install the [**@swim/ui**](swim-system-js/swim-ui-js)
and [**@swim/ux**](swim-system-js/swim-ux-js) libraries.
Visit [**swimOS.org**](https://www.swimos.org) to learn more.

## Architecture

**swimOS**, and the multiplexed streaming WARP protocol, make the World Wide
Web stateful, and massively real-time.  Massive real-time means that every
aspect of a Web application can be efficiently streamed in real-time—keeping
the whole WARP Web continuously in sync.  The **Swim Kernel** accomplishes this
by running general purpose, stateful distributed processes, called Web Agents,
that continuously communicate with each other, and with other applications,
using point-to-point multiplexed streaming APIs.  Web Agents can also natively
expose HTTP, WebSocket, and MQTT interfaces, making it easy to integrate
Web Agents into existing systems.

The architecture of **swimOS** fundamentally differs from traditional
distributed software platforms.  Instead of depending on a stack of middleware,
**swimOS** is architected like a higher order distributed operating system.
The **Swim Kernel** holistically distributes and executes all aspects of
stateful Web Agent applications, providing builtin distributed persistence,
messaging, scheduling, and multiplexed streaming APIs.

<img src="https://docs.swimos.org/readme/middleware-stack-vs-distributed-os.svg" alt="Middleware Stack vs. Distributed OS">

Vertical integration greatly simplifies application development and operations,
while radically improving performance.  CPUs are 1,000,000x+ faster than
networks.  By optimizing for data locality, and thereby eliminating numerous
superfluous network round-trips, **swimOS** slashes the time it takes to
perform many application operations from milliseconds to nanoseconds.
This performance boost doesn't trade-off scalability: **swimOS** is fully
distributed, and linearly scalable.

## [**Swim System** Java Implementation](swim-system-java)

The **Swim System** Java implementation provides a self-contained distributed
software platform for building stateful, massively real-time streaming
applications that run on any Java 8+ VM.  **Swim System** has no external
dependencies beyond a minimal JVM.

### [**Swim Core** Java Framework](swim-system-java/swim-core-java)

The **Swim Core** Java framework implements a dependency-free foundation
framework, with a lightweight concurrency engine, incremental I/O engine,
and flow-controlled network protocol implementations.  **Swim Core** consists
of the following component libraries:

- [**swim-util**](swim-system-java/swim-core-java/swim.util) –
  extended collection, iterator, and builder interfaces, lightweight cache
  sets and maps, and other foundational utilities.
- [**swim-codec**](swim-system-java/swim-core-java/swim.codec) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**swim-collections**](swim-system-java/swim-core-java/swim.collections) –
  immutable, structure sharing collections, including hash array mapped tries,
  finger tries, B-trees, and S-trees (sequence trees).
- [**swim-args**](swim-system-java/swim-core-java/swim.args) –
  composable command line argument parser.
- [**swim-structure**](swim-system-java/swim-core-java/swim.structure) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**swim-recon**](swim-system-java/swim-core-java/swim.recon) –
  object notation with attributes, like if JSON and XML had a baby.
- [**swim-json**](swim-system-java/swim-core-java/swim.json) –
  JavaScript Object Notation (JSON) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-xml**](swim-system-java/swim-core-java/swim.xml) –
  eXtensible Markup Language (XML) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-csv**](swim-system-java/swim-core-java/swim.csv) –
  Comma-Separated Values (CSV) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-protobuf**](swim-system-java/swim-core-java/swim.protobuf) –
  Protocol Buffers (protobuf) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-decipher**](swim-system-java/swim-core-java/swim.decipher) –
  universal decoder that detects and incrementally parses Recon, JSON, XML,
  Protobuf, raw text, and binary data formats as **swim-structure** values.
- [**swim-math**](swim-system-java/swim-core-java/swim.math) –
  mathematical and geometric structures, including rings, fields, vector
  modules and spaces, affine spaces, tensor spaces, probability distributions,
  and associated operators.
- [**swim-security**](swim-system-java/swim-core-java/swim.security) –
  signing and encryption of **swim-structure** values using the JSON Web Key
  (JWK), JSON Web Signature (JWS), JSON Web Token (JWT), and OpenID standards.
- [**swim-spatial**](swim-system-java/swim-core-java/swim.spatial) –
  geospatial projections and spatial collections, including sparse prefix
  Q-trees optimized for continuous n-body geofencing and real-time spatial
  clustering and reduction.
- [**swim-streamlet**](swim-system-java/swim-core-java/swim.streamlet) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**swim-dataflow**](swim-system-java/swim-core-java/swim.dataflow) –
  compiler from **swim-structure** expressions to live-updated data models.
- [**swim-observable**](swim-system-java/swim-core-java/swim.observable) –
  collection interfaces that notify registered observers of precise state changes.
- [**swim-uri**](swim-system-java/swim-core-java/swim.uri) –
  rich object model for working with Uniform Resource Identifiers,
  URI subcomponents, and URI patterns, including an efficient and
  safe codec for parsing and writing compliant URI strings.
- [**swim-deflate**](swim-system-java/swim-core-java/swim.deflate) –
  DEFLATE codec that incrementally compresses and decompresses streams.
- [**swim-mqtt**](swim-system-java/swim-core-java/swim.mqtt) –
  MQTT packet model and wire protocol codec that incrementally decodes
  and encodes MQTT streams without intermediate buffering.
- [**swim-http**](swim-system-java/swim-core-java/swim.http) –
  HTTP message model and wire protocol codec that incrementally decodes
  and encodes HTTP streams without intermediate buffering.
- [**swim-ws**](swim-system-java/swim-core-java/swim.ws) –
  WebSocket frame model and wire protocol codec that incrementally decodes
  and encodes fragmented WebSocket streams without intermediate buffering.
- [**swim-warp**](swim-system-java/swim-core-java/swim.warp) –
  WebSocket protocol for dynamically multiplexing large numbers of
  bidirectional links to streaming API endpoints, called lanes, of
  URI-addressed distributed objects, called nodes, that run stateful
  distributed processes, called Web Agents.
- [**swim-concurrent**](swim-system-java/swim-core-java/swim.concurrent) –
  timer, task, and continuation passing style interfaces, with lightweight
  scheduler and execution stage implementations.
- [**swim-db**](swim-system-java/swim-core-java/swim.db) –
  lock-free document store—optimized for high rate atomic state changes—that
  concurrently commits and compacts on-disk log-structured storage files
  without blocking parallel in-memory updates to associative B-tree maps,
  spatial Q-tree maps, sequential S-tree lists, and singleton U-tree values.
- [**swim-io**](swim-system-java/swim-core-java/swim.io) –
  explicitly flow-controlled, non-blocking, parallel I/O engine, with
  **swim-codec**-modulated socket modems, and TCP and TLS transports.
- [**swim-io-mqtt**](swim-system-java/swim-core-java/swim.io.mqtt) –
  MQTT socket modem for concurrently transporting explicitly flow-controlled
  MQTT streams over a network without blocking or intermediate buffering.
- [**swim-io-http**](swim-system-java/swim-core-java/swim.io.http) –
  HTTP client and server socket modems for pipelining and concurrently
  transporting explicitly flow-controlled HTTP streams over a network
  without blocking or intermediate buffering.
- [**swim-io-ws**](swim-system-java/swim-core-java/swim.io.ws) –
  WebSocket modem for concurrently transporting explicitly flow-controlled
  WebSocket streams over a network without blocking or intermediate buffering,
  and **swim-io-http** requesters and responders for upgrading HTTP client
  and server modems to WebSocket modems.
- [**swim-io-warp**](swim-system-java/swim-core-java/swim.io.warp) –
  WARP socket modem for multiplexing and concurrently transporting prioritized,
  explicitly flow-controlled WARP treams over a network, without blocking or
  intermediate buffering
- [**swim-web**](swim-system-java/swim-core-java/swim.web) –
  high-level web server API and routing DSL, with HTTP, WebSocket, and WARP
  routing directives.

### [**Swim Mesh** Java Framework](swim-system-java/swim-mesh-java)

The **Swim Mesh** Java framework provides the Web Agent API, and implements
a distributed WARP microkernel.  **Swim Mesh** consists of the following
component libraries:

- [**swim-api**](swim-system-java/swim-mesh-java/swim.api) –
- [**swim-store**](swim-system-java/swim-mesh-java/swim.store) –
- [**swim-runtime**](swim-system-java/swim-mesh-java/swim.runtime) –
- [**swim-kernel**](swim-system-java/swim-mesh-java/swim.kernel) –
- [**swim-auth**](swim-system-java/swim-mesh-java/swim.auth) –
- [**swim-actor**](swim-system-java/swim-mesh-java/swim.actor) –
- [**swim-service**](swim-system-java/swim-mesh-java/swim.service) –
- [**swim-store-mem**](swim-system-java/swim-mesh-java/swim.store.mem) –
- [**swim-store-db**](swim-system-java/swim-mesh-java/swim.store.db) –
- [**swim-remote**](swim-system-java/swim-mesh-java/swim.remote) –
- [**swim-service-web**](swim-system-java/swim-mesh-java/swim.service.web) –
- [**swim-java**](swim-system-java/swim-mesh-java/swim.java) –
- [**swim-server**](swim-system-java/swim-mesh-java/swim.server) –
- [**swim-client**](swim-system-java/swim-mesh-java/swim.client) –
- [**swim-cli**](swim-system-java/swim-mesh-java/swim.cli) –

### [**Swim Polyglot** Java Framework](swim-system-java/swim-polyglot-java)

The **Swim Polyglot** Java framework provides multi-language API bindings and
[GraalVM](https://www.graalvm.org/) integration for embedding guest languages
into **swimOS** applications.  **Swim Polyglot** consists of the following
component libraries:

- [**swim-dynamic**](swim-system-java/swim-polyglot-java/swim.dynamic) –
- [**swim-dynamic-java**](swim-system-java/swim-polyglot-java/swim.dynamic.java) –
- [**swim-dynamic-structure**](swim-system-java/swim-polyglot-java/swim.dynamic.structure) –
- [**swim-dynamic-observable**](swim-system-java/swim-polyglot-java/swim.dynamic.observable) –
- [**swim-dynamic-api**](swim-system-java/swim-polyglot-java/swim.dynamic.api) –
- [**swim-vm**](swim-system-java/swim-polyglot-java/swim.vm) –
- [**swim-vm-js**](swim-system-java/swim-polyglot-java/swim.vm.js) –
- [**swim-js**](swim-system-java/swim-polyglot-java/swim.js) –

## [**Swim System** TypeScript Implementation](swim-system-js)

The **Swim System** Typescript implementation provides a standalone set
of frameworks for building massively real-time streaming WARP clients and
web user interface applications.  **Swim System** encompasses the
[**Swim Core**](swim-system-js/swim-core-js) foundation framework, the
[**Swim Mesh**](swim-system-js/swim-mesh-js) multiplexed streaming WARP
framework, the [**Swim UI**](swim-system-js/swim-ui-js) and
[**Swim UX**](swim-system-js/swim-ux-js) real-time user interface toolkits,
and the [**Swim Web**](swim-system-js/swim-web-js) real-time web application
framework.  **Swim System** provides the following top-level libraries:

- [**@swim/system**](swim-system-js/@swim/system) –
  umbrella package that depends on, and re-exports, all **Swim System** child
  frameworks and libraries.

### [**Swim Core** TypeScript Framework](swim-system-js/swim-core-js)

The **Swim Core** TypeScript framework provides a lightweight, portable,
dependency-free, and strongly typed baseline on which to build higher level
libraries.  **Swim Core** consists of the following component libraries:

- [**@swim/core**](swim-system-js/swim-core-js/@swim/core) –
  umbrella package that depends on, and re-exports, all **Swim Core** libraries.
- [**@swim/util**](swim-system-js/swim-core-js/@swim/util) –
  ordering, equality, and hashing; type conversions; iterators; builders;
  maps; caches; and assertions.
- [**@swim/codec**](swim-system-js/swim-core-js/@swim/codec) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**@swim/args**](swim-system-js/swim-core-js/@swim/args) –
  composable command line argument parser.
- [**@swim/unit**](swim-system-js/swim-core-js/@swim/unit) –
  specializable unit testing framework.
- [**@swim/collections**](swim-system-js/swim-core-js/@swim/collections) –
  immutable, structure sharing collections, including B-trees and S-trees
  (sequence trees).
- [**@swim/structure**](swim-system-js/swim-core-js/@swim/structure) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**@swim/streamlet**](swim-system-js/swim-core-js/@swim/streamlet) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**@swim/dataflow**](swim-system-js/swim-core-js/@swim/dataflow) –
  compiler from **@swim/structure** expressions to live-updated data models.
- [**@swim/recon**](swim-system-js/swim-core-js/@swim/recon) –
  object notation with attributes, like if JSON and XML had a baby.
- [**@swim/math**](swim-system-js/swim-core-js/@swim/math) –
  mathematical and geometric structures and operators.
- [**@swim/time**](swim-system-js/swim-core-js/@swim/time) –
  date-time, time zone, and time interval data types,
  with `strptime`/`strftime`-style parsers and formatters.
- [**@swim/uri**](swim-system-js/swim-core-js/@swim/uri) –
  rich object model for working with Uniform Resource Identifiers and URI
  subcomponents, including an efficient and safe codec for parsing and
  writing compliant URI strings.

### [**Swim Mesh** TypeScript Framework](swim-system-js/swim-mesh-js)

The **Swim Mesh** TypeScript framework implements a multiplexed streaming WARP
client that runs in both Node.js and web browsers.  **Swim Mesh** consists of
the following component libraries:

- [**@swim/mesh**](swim-system-js/swim-mesh-js/@swim/mesh) –
  umbrella package that depends on, and re-exports, all **Swim Mesh** libraries.
- [**@swim/warp**](swim-system-js/swim-mesh-js/@swim/warp) –
  WebSocket protocol for dynamically multiplexing large numbers of
  bidirectional links to streaming API endpoints, called lanes, of
  URI-addressed distributed objects, called nodes, that run stateful
  distributed processes, called Web Agents.
- [**@swim/client**](swim-system-js/swim-mesh-js/@swim/client) –
  streaming API client for linking to lanes of stateful Web Agents using the
  WARP protocol, enabling massively real-time applications that continuously
  synchronize all shared states with ping latency.
- [**@swim/cli**](swim-system-js/swim-mesh-js/@swim/cli) –
  command line client for linking to Web Agent lanes over the WARP protocol.

### [**Swim UI** TypeScript Framework](swim-system-js/swim-ui-js)

The **Swim UI** TypeScript framework implements a massively real-time user
interface toolkit, with a unified view hierarchy for HTML, SVG, and Canvas
components, animated procedural styling, and constraint-based layouts.
**Swim UI** consists of the following component libraries:

- [**@swim/ui**](swim-system-js/swim-ui-js/@swim/ui) –
  umbrella package that depends on, and re-exports, all **Swim UI** libraries.
- [**@swim/angle**](swim-system-js/swim-ui-js/@swim/angle) –
  dimensional angle types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/length**](swim-system-js/swim-ui-js/@swim/length) –
  DOM-relative length types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/color**](swim-system-js/swim-ui-js/@swim/color) –
  RGB and HSL color types with color-space-aware operators, conversions,
  and parsers.
- [**@swim/font**](swim-system-js/swim-ui-js/@swim/font) –
  CSS font property types and parsers.
- [**@swim/transform**](swim-system-js/swim-ui-js/@swim/transform) –
  CSS and SVG compatible transform types with unit-aware algebraic operators
  and parsers.
- [**@swim/interpolate**](swim-system-js/swim-ui-js/@swim/interpolate) –
  interpolator types for blending between values, including numbers, dates,
  angles, lengths, colors, transforms, shapes, arrays, structures, and
  other interpolators.
- [**@swim/scale**](swim-system-js/swim-ui-js/@swim/scale) –
  scale types that map numeric and temporal input domains to interpolated
  output ranges, with support for continuous domain clamping, domain solving,
  range unscaling, and interpolation between scales.
- [**@swim/transition**](swim-system-js/swim-ui-js/@swim/transition) –
  transition types that specify duration, ease, interpolator, and lifecycle
  callback parameters for tween animations.
- [**@swim/animate**](swim-system-js/swim-ui-js/@swim/animate) –
  property-managing animator types that efficiently tween values between
  discrete state changes.
- [**@swim/dom**](swim-system-js/swim-ui-js/@swim/dom) –
  CustomEvent and ResizeObserver polyfills.
- [**@swim/style**](swim-system-js/swim-ui-js/@swim/style) –
  CSS style types and universal style value parser.
- [**@swim/render**](swim-system-js/swim-ui-js/@swim/render) –
  renderable graphic types for SVG/Canvas-compatible path drawing contexts,
  and Canvas-compatible rendering contexts.
- [**@swim/constraint**](swim-system-js/swim-ui-js/@swim/constraint) –
  incremental solver for systems of linear layout constraints.
- [**@swim/view**](swim-system-js/swim-ui-js/@swim/view) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- [**@swim/shape**](swim-system-js/swim-ui-js/@swim/shape) –
  canvas shape views, with animated geometry and style properties.
- [**@swim/typeset**](swim-system-js/swim-ui-js/@swim/typeset) –
  canvas typesetting views, with animated text, layout, font, and style properties.
- [**@swim/gesture**](swim-system-js/swim-ui-js/@swim/gesture) –
  multitouch gesture recognizers, with kinematic surface modeling.

### [**Swim UX** TypeScript Framework](swim-system-js/swim-ux-js)

The **Swim UX** TypeScript framework implements seamlessly animated user
interface widgets, including gauges, pie charts, line, area, and bubble charts,
and geospatial map overlays.  **Swim UX** consists of the following component
libraries:

- [**@swim/ux**](swim-system-js/swim-ux-js/@swim/ux) –
  umbrella package that depends on, and re-exports, all **Swim UX** libraries.
- [**@swim/gauge**](swim-system-js/swim-ux-js/@swim/gauge) –
  multi-dial, fully animatable, canvas rendered gauge widget.
- [**@swim/pie**](swim-system-js/swim-ux-js/@swim/pie) –
  multi-slice, fully animatable, canvas rendered pie chart widget.
- [**@swim/chart**](swim-system-js/swim-ux-js/@swim/chart) –
  multi-plot, fully animatable, canvas rendered chart widget, suppporting line,
  area, and bubble graphs, with customizeable axes, and kinematic multitouch
  scale gestures for panning and zooming with momentum.
- [**@swim/map**](swim-system-js/swim-ux-js/@swim/map) –
  canvas views for efficiently rendering geospatially located map overlays,
  including fully animatable views for lines, circles, and polygons.
- [**@swim/mapbox**](swim-system-js/swim-ux-js/@swim/mapbox) –
  support for overlaying **@swim/map** views on Mapbox maps.

### [**Swim Web** TypeScript Framework](swim-system-js/swim-web-js)

The **Swim Web** TypeScript framework implements a thin web application
framework built on the **Swim UI** toolkit.  **Swim Web** consists of the
following component libraries:

- [**@swim/web**](swim-system-js/swim-web-js/@swim/web) –
  umbrella package that depends on, and re-exports, all Swim Web libraries.
- [**@swim/site**](swim-system-js/swim-web-js/@swim/site) –
  minimalist components that implement common dynamic website behaviors.
- [**@swim/app**](swim-system-js/swim-web-js/@swim/app) –
  lightweight application loader that dynamically instantiates views and
  controllers declared by `swim-` HTML attributes.

## Concepts

**swimOS** unifies the traditionally disparate roles of database, message broker,
job manager, and application server, into a few simple constructs: Web Agents,
Lanes, Links, and Recon.  Web Agents run like continuous, general purpose
processes on heterogeneous distributed computers, called a Fabrics.

### Web Agents
**swimOS** applications consist of interconnected, distributed objects, called
Web Agents.  Each Web Agent has URI address, like a REST endpoint. But unlike
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
Communication only works if all parties understands one another.  **swimOS**
natively speaks a universal, structured data language, called Recon. A superset
of JSON, XML, Protocol Buffers, and more, Recon naturally translates into many
tongues.

### Fabrics
**swimOS** serves as the higher order operating system for distributed computers,
called Fabrics, which **swimOS** coherently stitches together from non-uniformly
distributed, heterogeneous sets of machines.
