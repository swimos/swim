# Swim

Swim implements a complete, self-contained, distributed application stack
in an embeddable software library. To develop server-side Swim apps, add
the `swim-loader` library to your Java project. To write a JavaScript client
application, install the `@swim/core` library from npm. To build a web
application, npm install the `@swim/ui` and `@swim/ux` libraries.

Visit [developer.swim.ai](http://developer.swim.ai) to learn more.

## Concepts

Swim unifies the traditionally disparate roles of database, message broker,
job manager, and application server, into a few simple constructs: Web Agents,
Lanes, Links, and Recon.

### Web Agents
Swim applications consist of interconnected, distributed objects, called Web
Agents. Each Web Agent has URI address, like a REST endpoint. But unlike
RESTful Web Services, Web Agents are stateful, and accessed via streaming APIs.

### Lanes
If Web Agents are distributed objects, then lanes serve as the properties and
methods of those objects. Lanes come in many flavors, value lanes, map lanes,
command lanes, and join lanes, to name a few. Many lanes are internally
persistent, acting like encapsulated databas tables.

### Links
Distributed objects need a way to communicate. Links establishes active
references to lanes of Web Agents, transparently streaming bi-directional state
changes to keep all parts of an application in sync, without the overhead of
queries or remote procedure calls.

### Recon
Communication only works if all parties understands one another. Swim natively
speaks a universal, structured data language, called Recon. A superset of JSON,
XML, Protocol Buffers, and more, Recon naturally translates into many tongues.
