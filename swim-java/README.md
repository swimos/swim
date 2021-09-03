# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Java SDK

The [Swim Java SDK][backend] contains software framework for building stateful
web services that interact via multiplexed streaming APIs.

- **Web Agents:** Every endpoint URI is backed by a dedicated virtual compute
  process, called a Web Agent.
- **Lanes:** Each Web Agent stores data in its own virtual "files", called Lanes.
- **Links:** Lanes can be continuously synchronized by dynamically "linking"
  to their streaming APIs.

The vertically integrated backend runtime executes in a single, self-contained
OS process per compute node.

- **Massive Scale:** Millions of Web Agents concurrently run on each server,
  with linear scalability across clusters.
- **General Purpose:** Application logic executes in remembered context at
  the speed of change.
- **Really Real-Time**: Precise updates propagate through the streaming web
  with ping latency.

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

- **[Swim backend stack][backend]**
- [Building stateful Web Agents][web-agents]
- [Managing real-time state in lanes][lanes]
- [Synchronizing remote state with links][links]
- [Deploying Web Agents as microservices][planes]

## Runtime

To embed the self-contained Swim runtime in a Java application,
add the `swim` library as a dependency of the project.

#### Gradle

```groovy
compile group: 'org.swimos', name: 'swim', version: '4.0.0-SNAPSHOT'
```

#### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim</artifactId>
  <version>4.0.0-SNAPSHOT</version>
</dependency>
```

## Development

The Swim backend stack runs on any Java 11+ JVM. Depending only on the minimal
`java.base` module, it has no other Java library dependencies.

### Build Environment

Install a Java 11+ JDK, such as [OpenJDK][openjdk] or [GraalVM][graalvm].
The stack is built with [Gradle][gradle], which can be invoked via the
included `gradlew` script.

### Compiling sources

```sh
./gradlew compileJava
```

### Running unit tests

```sh
./gradlew test
```

### Building API docs

```sh
./gradlew :javadoc
```

## Contributing

Check out the [Contributing Guide][contributing] to learn how to contribute
to the Swim Java SDK.

## License

Licensed under the [Apache 2.0 License][license].

[backend]: https://www.swimos.org/backend
[web-agents]: https://www.swimos.org/backend/web-agents
[lanes]: https://www.swimos.org/backend/lanes
[links]: https://www.swimos.org/backend/links
[planes]: https://www.swimos.org/backend/planes
[openjdk]: https://openjdk.java.net
[graalvm]: https://www.graalvm.org/downloads/
[gradle]: https://gradle.org
[contributing]: CONTRIBUTING.md
[license]: LICENSE
