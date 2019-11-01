# Swim System Java Implementation

[![package](https://img.shields.io/github/tag/swimOS/swim.svg?label=maven)](https://mvnrepository.com/artifact/org.swimos)
[![documentation](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim System** Java implementation provides a self-contained distributed
software platform executing stateful Web Agent applications.  **Swim System**
encompasses the [**Swim Core**](swim-core-java) foundation framework, the
[**Swim Mesh**](swim-mesh-java) distributed microkernel and Web Agent framework,
and the [**Swim Polyglot**](swim-polyglot-java) multi-language virtual machine
framework.

## Umbrella Framework

The **Swim System** umbrella framework provides a self-contained distributed
software platform for building stateful, massively real-time streaming
applications that run on any Java 8+ VM.  **Swim System** has no external
dependencies beyond a minimal JVM.

### [**Swim Core** Framework](swim-core-java)

The **Swim Core** framework implements a dependency-free foundation
framework, with a lightweight concurrency engine, incremental I/O engine,
and flow-controlled network protocol implementations.  **Swim Core** consists
of the following component libraries:

- [**swim-util**](swim-core-java/swim.util) –
  extended collection, iterator, and builder interfaces, lightweight cache
  sets and maps, and other foundational utilities.
- [**swim-codec**](swim-core-java/swim.codec) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**swim-collections**](swim-core-java/swim.collections) –
  immutable, structure sharing collections, including hash array mapped tries,
  finger tries, B-trees, and S-trees (sequence trees).
- [**swim-args**](swim-core-java/swim.args) –
  composable command line argument parser.
- [**swim-structure**](swim-core-java/swim.structure) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**swim-recon**](swim-core-java/swim.recon) –
  object notation with attributes, like if JSON and XML had a baby.
- [**swim-json**](swim-core-java/swim.json) –
  JavaScript Object Notation (JSON) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-xml**](swim-core-java/swim.xml) –
  eXtensible Markup Language (XML) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-csv**](swim-core-java/swim.csv) –
  Comma-Separated Values (CSV) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-avro**](swim-core-java/swim.avro) –
  Apache Avro codec that incrementally parses and writes **swim-structure** values.
- [**swim-protobuf**](swim-core-java/swim.protobuf) –
  Protocol Buffers (protobuf) codec that incrementally parses and writes
  **swim-structure** values.
- [**swim-decipher**](swim-core-java/swim.decipher) –
  universal decoder that detects and incrementally parses Recon, JSON, XML,
  Protobuf, raw text, and binary data formats as **swim-structure** values.
- [**swim-math**](swim-core-java/swim.math) –
  mathematical and geometric structures, including rings, fields, vector
  modules and spaces, affine spaces, tensor spaces, probability distributions,
  and associated operators.
- [**swim-security**](swim-core-java/swim.security) –
  signing and encryption of **swim-structure** values using the JSON Web Key
  (JWK), JSON Web Signature (JWS), JSON Web Token (JWT), and OpenID standards.
- [**swim-spatial**](swim-core-java/swim.spatial) –
  geospatial projections and spatial collections, including sparse prefix
  Q-trees optimized for continuous n-body geofencing and real-time spatial
  clustering and reduction.
- [**swim-streamlet**](swim-core-java/swim.streamlet) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**swim-dataflow**](swim-core-java/swim.dataflow) –
  compiler from **swim-structure** expressions to live-updated data models.
- [**swim-observable**](swim-core-java/swim.observable) –
  collection interfaces that notify registered observers of precise state changes.
- [**swim-uri**](swim-core-java/swim.uri) –
  rich object model for working with Uniform Resource Identifiers,
  URI subcomponents, and URI patterns, including an efficient and
  safe codec for parsing and writing compliant URI strings.
- [**swim-deflate**](swim-core-java/swim.deflate) –
  DEFLATE codec that incrementally compresses and decompresses streams.
- [**swim-mqtt**](swim-core-java/swim.mqtt) –
  MQTT packet model and wire protocol codec that incrementally decodes
  and encodes MQTT streams without intermediate buffering.
- [**swim-http**](swim-core-java/swim.http) –
  HTTP message model and wire protocol codec that incrementally decodes
  and encodes HTTP streams without intermediate buffering.
- [**swim-ws**](swim-core-java/swim.ws) –
  WebSocket frame model and wire protocol codec that incrementally decodes
  and encodes fragmented WebSocket streams without intermediate buffering.
- [**swim-warp**](swim-core-java/swim.warp) –
  WebSocket protocol for dynamically multiplexing large numbers of
  bidirectional links to streaming API endpoints, called lanes, of
  URI-addressed distributed objects, called nodes, that run stateful
  distributed processes, called Web Agents.
- [**swim-concurrent**](swim-core-java/swim.concurrent) –
  timer, task, and continuation passing style interfaces, with lightweight
  scheduler and execution stage implementations.
- [**swim-db**](swim-core-java/swim.db) –
  lock-free document store—optimized for high rate atomic state changes—that
  concurrently commits and compacts on-disk log-structured storage files
  without blocking parallel in-memory updates to associative B-tree maps,
  spatial Q-tree maps, sequential S-tree lists, and singleton U-tree values.
- [**swim-io**](swim-core-java/swim.io) –
  explicitly flow-controlled, non-blocking, parallel I/O engine, with
  **swim-codec**-modulated socket modems, and TCP and TLS transports.
- [**swim-io-mqtt**](swim-core-java/swim.io.mqtt) –
  MQTT socket modem for concurrently transporting explicitly flow-controlled
  MQTT streams over a network without blocking or intermediate buffering.
- [**swim-io-http**](swim-core-java/swim.io.http) –
  HTTP client and server socket modems for pipelining and concurrently
  transporting explicitly flow-controlled HTTP streams over a network
  without blocking or intermediate buffering.
- [**swim-io-ws**](swim-core-java/swim.io.ws) –
  WebSocket modem for concurrently transporting explicitly flow-controlled
  WebSocket streams over a network without blocking or intermediate buffering,
  and **swim-io-http** requesters and responders for upgrading HTTP client
  and server modems to WebSocket modems.
- [**swim-io-warp**](swim-core-java/swim.io.warp) –
  WARP socket modem for multiplexing and concurrently transporting prioritized,
  explicitly flow-controlled WARP treams over a network, without blocking or
  intermediate buffering
- [**swim-web**](swim-core-java/swim.web) –
  high-level web server API and routing DSL, with HTTP, WebSocket, and WARP
  routing directives.

### [**Swim Mesh** Framework](swim-mesh-java)

The **Swim Mesh** framework provides the Web Agent API, and implements
a distributed WARP microkernel.  **Swim Mesh** consists of the following
component libraries:

- [**swim-api**](swim-mesh-java/swim.api) –
- [**swim-store**](swim-mesh-java/swim.store) –
- [**swim-runtime**](swim-mesh-java/swim.runtime) –
- [**swim-kernel**](swim-mesh-java/swim.kernel) –
- [**swim-auth**](swim-mesh-java/swim.auth) –
- [**swim-actor**](swim-mesh-java/swim.actor) –
- [**swim-service**](swim-mesh-java/swim.service) –
- [**swim-store-mem**](swim-mesh-java/swim.store.mem) –
- [**swim-store-db**](swim-mesh-java/swim.store.db) –
- [**swim-remote**](swim-mesh-java/swim.remote) –
- [**swim-service-web**](swim-mesh-java/swim.service.web) –
- [**swim-java**](swim-mesh-java/swim.java) –
- [**swim-server**](swim-mesh-java/swim.server) –
- [**swim-client**](swim-mesh-java/swim.client) –
- [**swim-cli**](swim-mesh-java/swim.cli) –

### [**Swim Polyglot** Framework](swim-polyglot-java)

The **Swim Polyglot** framework provides multi-language API bindings and
[GraalVM](https://www.graalvm.org/) integration for embedding guest languages
into **swimOS** applications.  **Swim Polyglot** consists of the following
component libraries:

- [**swim-dynamic**](swim-polyglot-java/swim.dynamic) –
- [**swim-dynamic-java**](swim-polyglot-java/swim.dynamic.java) –
- [**swim-dynamic-structure**](swim-polyglot-java/swim.dynamic.structure) –
- [**swim-dynamic-observable**](swim-polyglot-java/swim.dynamic.observable) –
- [**swim-dynamic-api**](swim-polyglot-java/swim.dynamic.api) –
- [**swim-vm**](swim-polyglot-java/swim.vm) –
- [**swim-vm-js**](swim-polyglot-java/swim.vm.js) –
- [**swim-js**](swim-polyglot-java/swim.js) –

## Usage

To embed the **Swim Kernel** directly into your application, add the
**swim-server** library to your project's dependencies.

### Gradle

```groovy
compile group: 'org.swimos', name: 'swim-server', version: '3.10.0'
```

### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim-server</artifactId>
  <version>3.10.0</version>
</dependency>
```

## Development

**swimOS** runs on any Java 8+ VM with a minimal `java.base` classpath.
**swimOS** uses [Gradle](https://gradle.org/) as its standard build system.
The included `gradlew` script can be used to build the platform.

### Setup

Install a Java 8+ JDK, such as [OpenJDK](https://openjdk.java.net/) or
[GraalVM](https://www.graalvm.org/downloads/).

### Compiling sources

```sh
swim-system-java $ ./gradlew compileJava
```

### Running tests

```sh
swim-system-java $ ./gradlew test
```

### Building documentation

```sh
swim-system-java $ ./gradlew :javadoc
```
