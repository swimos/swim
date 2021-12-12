# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Collections Library

The Swim Collections library implements immutable, structure sharing
collections, including B-trees and S-trees (sequence trees).

## Overview

### B-trees

The `BTree` class implements the `OrderedMap` interface from **@swim/util**,
and compares keys using `Objects.compare`, also from **@swim/util**. `BTree`
is internally immutable, enabling lightweight snapshotting via `BTree.clone`,
and non-destructive mutation via `BTree.updated`, and `BTree.removed`.

`BTree` also implements the `ReducedMap` interface from **@swim/util**,
providing storage of sub-tree reductions in b-tree nodes to support log
time recomputation of whole tree reductions after incremental updates.

### S-trees

The `STree` class implements a sequential list data type that's backed by an
implicitly indexed b-tree. Like `BTree`, `STree` supports lightweight
snapshotting via `STree.clone`.

`STree` associated a unique ID with each list item, which can be used to
reconcile concurrent, conflicting updates to the same logical list.
