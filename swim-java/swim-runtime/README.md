# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Java Runtime

The Swim backend runtime provides a self-contained application server for
hosting stateful Web Agents. The runtime provides Web Agent applications with:

- **Compute Scheduling:** Each Web Agent runs in a long-lived logical compute
  process that executes arbitrary application code in response to real-time
  state changes, scheduled timers, and other system events.
- **State Management:** The program state of each agent is preserved locally
  between operations. Processing latencies are measured in nanoseconds—the time
  needed to access local memory.
- **Local Persistence:** Unused state is transparently persisted to local disks,
  when available. Web Agents pick up where they left off afte a restart. And
  vastly more data than fits in main memory can be maintained as agent state.
- **Cache Coherence:** Web Agents operate on locally materialized views of
  remote states. Real-time changes made to one view of a shared state propagate
  to all other linked views with ping latency. A cache coherent streaming
  memory model ensures that all views consistently converge to the same state.

## Documentation

- [API Docs][api-docs]

## Runtime

To embed the Swim backend runtime in a Java application, add the `swim-runtime`
library as a dependency of the project.

#### Gradle

```groovy
compile group: 'org.swimos', name: 'swim-runtime', version: '4.0.0'
```

#### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim-runtime</artifactId>
  <version>4.0.0</version>
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

Take a look at the [Contributing Guide][contributing] to learn about our
submission process, coding standards, and more.

[api-docs]: https://docs.swimos.org/java/4.x
[openjdk]: https://openjdk.java.net
[graalvm]: https://www.graalvm.org/downloads/
[gradle]: https://gradle.org
[contributing]: CONTRIBUTING.md
