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
- [**swim-spatial**](swim.spatial) –
- [**swim-streamlet**](swim.streamlet) –
- [**swim-dataflow**](swim.dataflow) –
- [**swim-observable**](swim.observable) –
- [**swim-uri**](swim.uri) –
- [**swim-deflate**](swim.deflate) –
- [**swim-mqtt**](swim.mqtt) –
- [**swim-http**](swim.http) –
- [**swim-ws**](swim.ws) –
- [**swim-warp**](swim.warp) –
- [**swim-concurrent**](swim.concurrent) –
- [**swim-db**](swim.db) –
- [**swim-io**](swim.io) –
- [**swim-io-mqtt**](swim.io.mqtt) –
- [**swim-io-http**](swim.io.http) –
- [**swim-io-ws**](swim.io.ws) –
- [**swim-io-warp**](swim.io.warp) –
- [**swim-web**](swim.web) –

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
