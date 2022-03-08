# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Dataflow Library

The Swim Dataflow library implements a compiler from dynamic [structure][structure]
expressions to live-updated documents driven by [streamlet][streamlet] dataflow graphs.

## Overview

A live updated data structure is represented as a `RecordScope`, which extends
the base Swim Structure `Record` class. An ordinary `Record` can be recursively
compiled into a `RecordScope` by invoking the `RecordScope.create` factory method.
A compiled `RecordScope` has all of its nested expressions replaced by their
evaluated state. Unlike evaluating a `Record` with an `Interpreter`, if a
member of a `RecordScope` changes, all expressions that transitively depend on
that member get flagged for recomputation, which occurs the next time
`recohereInput` gets invoked on the `RecordScope`.

The `Dataflow.compile` method can also be used to compile an arbitrary
Swim Structure expression into an `Outlet` that updates whenever
the state of any of its transitively dependend expressions changes.

[structure]: https://github.com/swimos/swim/tree/main/swim-js/swim-runtime/swim-core/@swim/structure
[streamlet]: https://github.com/swimos/swim/tree/main/swim-js/swim-runtime/swim-core/@swim/streamlet
