# swim-db

[![package](https://img.shields.io/maven-central/v/org.swimos/swim-util?label=maven)](https://mvnrepository.com/artifact/org.swimos/swim-db)
[![documentation](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest/swim.db/module-summary.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**swim-db** implements a lock-free document store—optimized for high rate
atomic state changes—that concurrently commits and compacts on-disk
log-structured storage files without blocking parallel in-memory updates
to associative B-tree maps, spatial Q-tree maps, sequential S-tree lists,
and singleton U-tree values.  **swim-db** is part of the
[**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java) framework.

## Usage

Add the **swim-db** library to your project's dependencies.

### Gradle

```groovy
compile group: 'org.swimos', name: 'swim-db', version: '3.10.0'
```

### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim-db</artifactId>
  <version>3.10.0</version>
</dependency>
```
