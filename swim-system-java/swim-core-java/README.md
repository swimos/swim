# Swim Core Java Framework

[![package](https://img.shields.io/github/tag/swimOS/swim.svg?label=maven)](https://mvnrepository.com/artifact/org.swimos)
[![documentation](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim Core** framework implements a dependency-free foundation
framework, with a lightweight concurrency engine, incremental I/O engine,
and flow-controlled network protocol implementations.  **Swim Core** is part
of the broader [**Swim System**](https://github.com/swimos/swim/tree/master/swim-system-java) framework.

## Framework

The **Swim Core** framework consists of the following component libraries:

- [**swim-util**](swim.util) –
  extended collection, iterator, and builder interfaces, lightweight cache
  sets and maps, and other foundational utilities.
- [**swim-codec**](swim.codec) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**swim-collections**](swim.collections) –
  immutable, structure sharing collections, including hash array mapped tries,
  finger tries, B-trees, and S-trees (sequence trees).
- [**swim-args**](swim.args) –
  composable command line argument parser.
- [**swim-structure**](swim.structure) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**swim-recon**](swim.recon) –
  object notation with attributes, like if JSON and XML had a baby.
- [**swim-json**](swim.json) –
  JavaScript Object Notation (JSON) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-xml**](swim.xml) –
  eXtensible Markup Language (XML) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-csv**](swim.csv) –
  Comma-Separated Values (CSV) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-avro**](swim.avro) –
  Apache Avro codec that incrementally parses and writes **swim-structure** values.
- [**swim-protobuf**](swim.protobuf) –
  Protocol Buffers (protobuf) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-decipher**](swim.decipher) –
  universal decoder that detects and incrementally parses Recon, JSON, XML,
  Protobuf, raw text, and binary data formats as **swim-structure** values.
- [**swim-math**](swim.math) –
  mathematical and geometric structures, including rings, fields, vector
  modules and spaces, affine spaces, tensor spaces, probability distributions,
  and associated operators.
- [**swim-security**](swim.security) –
  signing and encryption of **swim-structure** values using the JSON Web Key
  (JWK), JSON Web Signature (JWS), JSON Web Token (JWT), and OpenID standards.
- [**swim-spatial**](swim.spatial) –
  geospatial projections and spatial collections, including sparse prefix
  Q-trees optimized for continuous n-body geofencing and real-time spatial
  clustering and reduction.
- [**swim-streamlet**](swim.streamlet) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**swim-dataflow**](swim.dataflow) –
  compiler from **swim-structure** expressions to live-updated data models.
- [**swim-observable**](swim.observable) –
  collection interfaces that notify registered observers of precise state changes.
- [**swim-uri**](swim.uri) –
  rich object model for working with Uniform Resource Identifiers,
  URI subcomponents, and URI patterns, including an efficient and
  safe codec for parsing and writing compliant URI strings.
- [**swim-deflate**](swim.deflate) –
  DEFLATE codec that incrementally compresses and decompresses streams.
- [**swim-mqtt**](swim.mqtt) –
  MQTT packet model and wire protocol codec that incrementally decodes
  and encodes MQTT streams without intermediate buffering.
- [**swim-http**](swim.http) –
  HTTP message model and wire protocol codec that incrementally decodes
  and encodes HTTP streams without intermediate buffering.
- [**swim-ws**](swim.ws) –
  WebSocket frame model and wire protocol codec that incrementally decodes
  and encodes fragmented WebSocket streams without intermediate buffering.
- [**swim-warp**](swim.warp) –
  WebSocket protocol for dynamically multiplexing large numbers of
  bidirectional links to streaming API endpoints, called lanes, of
  URI-addressed distributed objects, called nodes, that run stateful
  distributed processes, called Web Agents.
- [**swim-concurrent**](swim.concurrent) –
  timer, task, and continuation passing style interfaces, with lightweight
  scheduler and execution stage implementations.
- [**swim-db**](swim.db) –
  lock-free document store—optimized for high rate atomic state changes—that
  concurrently commits and compacts on-disk log-structured storage files
  without blocking parallel in-memory updates to associative B-tree maps,
  spatial Q-tree maps, sequential S-tree lists, and singleton U-tree values.
- [**swim-io**](swim.io) –
  explicitly flow-controlled, non-blocking, parallel I/O engine, with
  **swim-codec**-modulated socket modems, and TCP and TLS transports.
- [**swim-io-mqtt**](swim.io.mqtt) –
  MQTT socket modem for concurrently transporting explicitly flow-controlled
  MQTT streams over a network without blocking or intermediate buffering.
- [**swim-io-http**](swim.io.http) –
  HTTP client and server socket modems for pipelining and concurrently
  transporting explicitly flow-controlled HTTP streams over a network
  without blocking or intermediate buffering.
- [**swim-io-ws**](swim.io.ws) –
  WebSocket modem for concurrently transporting explicitly flow-controlled
  WebSocket streams over a network without blocking or intermediate buffering,
  and **swim-io-http** requesters and responders for upgrading HTTP client
  and server modems to WebSocket modems.
- [**swim-io-warp**](swim.io.warp) –
  WARP socket modem for multiplexing and concurrently transporting prioritized,
  explicitly flow-controlled WARP treams over a network, without blocking or
  intermediate buffering
- [**swim-web**](swim.web) –
  high-level web server API and routing DSL, with HTTP, WebSocket, and WARP
  routing directives.

## Development

**Swim Core** runs on any Java 8+ VM with a minimal `java.base` classpath.
**Swim Core** uses [Gradle](https://gradle.org/) as its standard build system.
The included `gradlew` script can be used to build the framework.

### Compiling sources

```sh
swim-core-java $ ./gradlew compileJava
```

### Running tests

```sh
swim-core-java $ ./gradlew test
```

### Building documentation

```sh
swim-core-java $ ./gradlew :javadoc
```
