# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Streamlet Library

The Swim Streamlet library implements a streaming state machine framework.
Streamlets are stateful application components that continuously consume input
states from streaming inlets, and continuously produce output states on
streaming outlets.

## Overview

Streamlets defines a model for continuous stateful computations that consume
many streaming input states, and produce many streaming output states.
The streamlet model facilitates dynamic binding of streaming application
components to their inputs and outputs, and provides a precise, rate decoupled,
backpressure regulated, re-evaluation model for reconciling the state of
streamlet components after their transitively dependent input states change.

Streamlets are general purpose programming constructs; they are _not_
restricted to modelling pure, data parallel functions. Unlinke Spark RDDs,
or Flink Datasets, Streamlets can encapsulate arbitrary streaming business
logic. And unlike [Reactive Streams](http://www.reactive-streams.org), which
are purely demand driven, Streamlets model both supply and demand signals,
enabling significantly optimized subgraph re-evaluation when sets of input
states change concurrently.

### Inlets, Outlets, and Streamlets

The streamlet programming model introduces three key concepts: inlets, outlets,
and streamlets.

- **`Inlet`** – a consumer of state changes.
- **`Outlet`** – a producer of state changes.
- **`Streamlet`** – a stateful component with zero or more named input outlets,
  and zero or more named output inlets.

Additional derivative `Inlet` and `Outlet` types provide specialized interfaces
for structured input and output states.

- **`MapInlet`** – a consumer of keyed state changes, i.e. updates to a
  key-value map.
- **`MapOutlet`** – a producer of keyed state changes, i.e. updates to a
  key-value map.

### Combinators

Outlets, being sources of state, define functional combinators, such as `map`,
`filter`, and `reduce`, that produce new, transformed outlets. The Streamlet
model enables ultra efficient recomputation of combinators. The `reduce`
combinator, for example, memoizes partial reduction products in a b-tree,
enabling log-time updates to its reduced state when any given input key changes.
