# swim-io-ws

[![package](https://img.shields.io/maven-central/v/org.swimos/swim-util?label=maven)](https://mvnrepository.com/artifact/org.swimos/swim-io-ws)
[![documentation](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest/swim.io.ws/module-summary.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**swim-io-ws** implements a WebSocket modem for concurrently transporting
explicitly flow-controlled WebSocket streams over a network without blocking
or intermediate buffering, and
[**swim-io-http**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java/swim.io.http)
requesters and responders for upgrading HTTP client and server modems to
WebSocket modems.  **swim-io-ws** is part of the
[**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java) framework.

## Usage

Add the **swim-io-ws** library to your project's dependencies.

### Gradle

```groovy
compile group: 'org.swimos', name: 'swim-io-ws', version: '3.10.0'
```

### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim-io-ws</artifactId>
  <version>3.10.0</version>
</dependency>
```
