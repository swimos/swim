# swim-warp

[![package](https://img.shields.io/maven-central/v/org.swimos/swim-util?label=maven)](https://mvnrepository.com/artifact/org.swimos/swim-warp)
[![documentation](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest/swim.warp/module-summary.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**swim-warp** implements the WARP WebSocket protocol for dynamically
multiplexing large numbers of bidirectional links to streaming API endpoints,
called lanes, of URI-addressed distributed objects, called nodes, that run
stateful distributed processes, called Web Agents.  **swim-warp** is part of
the [**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java) framework.

## Protocol overview

The name WARP stands for *W*eb *A*gent *R*emote *P*rotocol.  The purpose
of the WARP protocol is to enable bidirectional, continuously consistent,
network real-time communication between stateful distributed processes,
called Web Agents.

The first and most important design goal for WARP is to be extensible, forward
compatible, and easy to implement in any networked environment.  In particular,
WARP has to work in all major web browsers, using existing networking
technologies.  To facilitate human understanding of the protocol and its
operation, the first version of WARP is text-based.  To avoid the explosion
of grammars found in other human-readable protocols, like HTTP, and to aid
extensibility, WARP protocol envelopes are defined as a set of structurally
typed [**Recon**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java/swim.recon) records.

The second most important design goal for WARP is to support efficient
multiplexing of extremely large numbers of links.  WARP scales to many millions
of high rate links per WebSocket connection.  Imagine if every hyperlink on the
Web was a real-time stream between web pages—that's the level of concurrency
WARP aims to support.

The third most important design goal for WARP is minimalism.  WARP supports
forward-compatible, per-link subprotocols, enabling protocol stability without
stagnation.  The core WARP protocol remains unchanged since its original
implementation in 2015, despite significant evolution of swimOS, and its
extensive use of WARP subprotocols.

Future evolution of the WARP protocol must maintain the delicate balance
between extreme multiplexability, broad implementability, extensibility,
forward compatibility, and minimalism.

### Envelopes

The data structures exchanged over WARP connections are called _envelopes_.
WARP defines 12 envelope types: event messages, command messages, link requests
and responses, sync requests and responses, unlink requests and responses, auth
requests and responses, and deauth requests and responses.

Envelopes can be addressed in one of three ways: host addressed, lane addressed,
or link addressed.  Host addressed envelopes simply get delivered to the other
end of the network connection.

Lane addressed envelopes route to a particular lane, of a particular node.
Nodes and lanes are each addressed by URI.  Node URIs are scoped to a network
host, like HTTP request URIs.  Lane URIs are scoped to an encapsulating node,
like a member of an object.

Link addressed envelopes route along the path of a currently open link.
Links are currently addressed by the complete node and lane URIs of the remote
endpoint.  Explicit link addressing greatly aids human readability of the wire
protocol, and compression effectively mitigates the transport overhead.  Link
addresses are intended to be coupled to stream identifiers in an underlying
multiplexed transport protocol, such as QUIC, in a future evolution of the
WARP protocol.

WARP is a symmetric protocol: any envelope type can be sent in any direction.
It's perfectly valid for a server to send a link request to a client;
this capability is important for reverse tunneling of links to endpoints
that can only open outbound connections.

Request and response envelopes trigger link state transitions—request envelopes
do not always or immediately pair with corresponding response envelopes.
For example, a link request may be replied to with an unlinked response,
if the link request is rejected.  And a sync request only receives a matching
synced response once the state of the link quiesces.

### Event messages

An event message is a link addressed envelope that transmits a structured data
payload to the receiving end of a link.

An event message is distinguished by an `@event` attribute:

```recon
@event(node: "/house/kitchen", lane: "light") "off"
```

### Command messages

A command message is a lane addressed envelope that transmit a structured data
payload to a particular lane of a particular node.  Command messages may be
fast-path routed via an open link to the recipient lane.

A command message is distinguished by a `@command` attribute:

```recon
@command(node: "/house/kitchen", lane: "light") "on"
```

### Link requests and and responses

A link request is a lane addressed envelope that initiates the opening of a new
link to the recipient lane.  A linked response is a link addressed envelope
that finalizes the opening of a new link.

A link request is distinguished by a `@link` attribute:

```recon
@link(node: "/house/kitchen", lane: "light")
```

A linked response is distinguished by a `@linked` attribute:

```recon
@linked(node: "/house/kitchen", lane: "light")
```

### Sync requests and responses

A sync request is a lane addressed envelope that both initiates the opening of
a new link to the recipient lane, and requests synchronization with the current
state of the remote lane.  A synced response is a link addressed envelope that
indicates completion of initial link synchronization.

A sync request is distinguished by a `@sync` attribute:

```recon
@sync(node: "/house", lane: "rooms")
```

A synced response is distinguished by a `@synced` attribute:

```recon
@synced(node: "/house lane: "rooms")
```

### Unlink requests and responses

An unlink request is a link addressed envelope that initiates the closure of
a link.  An unlinked response is a link addressed envelope that finalizes the
closure of a link.

An unlink request is distinguished by an `@unlink` attribute:

```recon
@unlink(node: "/house", lane: "power/meter")
```

An unlinked response is distinguished by an `@unlinked` attribute:

```recon
@unlinked(node: "/house", lane: "power/meter")
```

### Auth requests and responses

An auth request is a host addressed envelope that authenticates the sender.
An authed response is a host addressed envelope that acknowledges the
credentials of the receipient.

An auth request is distinguished by an `@auth` attribute:

```recon
@auth @googleId(<jwt>)
```

An authed response is distinguished by an `@authed` attribute:

```recon
@authed
```

### Deauth requests and responses

A deauth request is a host addressed envelope that deauthenticates the sender.
A deauthed response is a host addressed envelope that revokes the credentials
of the recipient.

A deauth request is distinguished by a `@deauth` attribute:

```recon
@deauth
```

A deauthed response is distinguished by a `@deauthed` attribute:

```recon
@deauthed
```

## Usage

Add the **swim-warp** library to your project's dependencies.

### Gradle

```groovy
compile group: 'org.swimos', name: 'swim-warp', version: '3.10.0'
```

### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim-warp</artifactId>
  <version>3.10.0</version>
</dependency>
```
