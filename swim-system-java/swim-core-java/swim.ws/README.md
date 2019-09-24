# swim-ws

[![package](https://img.shields.io/maven-central/v/org.swimos/swim-util?label=maven)](https://mvnrepository.com/artifact/org.swimos/swim-ws)
[![documentation](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest/swim.ws/module-summary.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**swim-ws** implements a WebSocket frame model and wire protocol codec that
incrementally decodes and encodes fragmented WebSocket streams without
intermediate buffering.  **swim-ws** is part of the
[**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java) framework.

## Usage

Add the **swim-ws** library to your project's dependencies.

### Gradle

```groovy
compile group: 'org.swimos', name: 'swim-ws', version: '3.10.0'
```

### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim-ws</artifactId>
  <version>3.10.0</version>
</dependency>
```
