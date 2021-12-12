# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Util Library

The Swim Util library provides interfaces for ordering, equality, hashing,
type conversions, functional maps, interpolators, scales, iterators, builders,
key-value maps, caches, and assertions.

## Overview

### Ordering, equality, and hashing

Swim Util exports `Comparable`, `Equals`, and `HashCode` interfaces that can
be implemented by ordered, equatable, and hashable classes, respectively.

```typescript
export interface Comparable<T> {
  compareTo(that: T): number;
}
export interface Equals {
  equals(that: unknown): boolean;
}
export interface HashCode extends Equals {
  hashCode(): number;
}
```

The exported `Objects` object supports generic comparison, equality testing,
and hashing of arbitrary JavaScript values, including primitives, arrays, and
objects.

`Objects.compare(x: unknown, y: unknown): 0 | 1 | -1` returns the relative
sort order of two comparable values. If `x` implements `Comparable`, then
`Objects.compare` delegates to `x`'s `compareTo` method. If `x` and `y` are
both numbers, or both strings, they are compared lexicographically. If `x`
and `y` are both arrays, then each corresponding element is compared, in turn,
using `Objects.compare`. If `x` and `y` are both objects, then each entry is
compared first by key, then by value, using `Objects.compare`. Values of
incompatible types sort in a deterministic order based on type.

`Objects.equal(x: unknown, y: unknown): boolean` returns `true` if two values
are equivalent. If `x` implements `Equals`, then `Objects.equal` delegates to
`x`'s `equals` method. If `x` and `y` are both primitives, then they are
compared by value. If `x` and `y` are both arrays, then each corresponding
element is tested for equality, in turn, using `Objects.equal`. If `x` and `y`
are both objects, then each entry is tested for equality furst by key, then by
value, using `Objects.equal`.

`Objects.hash(x: unknown): number` returns a consistent hash code for `x`.
If `x` implements `HashCode`, then `Objects.hash` delegate's to `x`'s
`hashCode` method. If `x` is a primitive, it is hashed using the `Murmur3`
hashing algorithm. If `x` is an array, each element is hashed individually
using `Objects.hash`, and the hash codes of all elements get mixed together.
If `x` is an object, each entry has its key and value hashed using
`Objects.hash`, and the hash codes of all entries get mixed together.

The exported `Murmur3` object implements the 32-bit
[MurmurHash](https://en.wikipedia.org/wiki/MurmurHash) algorithm, version 3.

### Type conversions

Swim Util provides two generic interfaces for converting between loosely
JavaScript values, and strongly typed TypeScript values, called `FromAny` and
`ToAny`.

```typescript
export interface FromAny<T, U = T> {
  fromAny(value: T | U): T;
}
export interface ToAny<T> {
  toAny(): T;
}
```

`FromAny` is implicitly implemented by classes that have a static `fromAny`
method that converts a loosely typed JavaScript value into a strongly typed
TypeScript value.

`ToAny` is implemented by classes that have a `tonAny` method that returns a
loosely typed JavaScript value. `ToAny` is used to abstract over the
conversion of strongly typed values to loosely typed values.

### Iterator interfaces

Swim Util exports an ES6-compatible `Iterator` interface, as well as a
`Cursor` base class for positioned iterators.

```typescript
export interface Iterator<T> {
  next(): {value?: T, done: boolean};
}
```

### Builder interfaces

The exported `Builder` interface abstracts over construction of collections.
And the `PairBuilder` interface abstracts over construction of key-value maps,
and other pair-containing collections.

```typescript
export interface Builder<I, O> {
  push(...inputs: I[]): void;
  bind(): O;
}
export interface PairBuilder<K, V, O> {
  add(key: K, value: V): void;
  bind(): O;
}
```

### Map interfaces

Swim Util defines three key-value map interfaces: an ES6-compatible `Map`
interface, as well as an `OrderedMap` interface, and a `ReducedMap` interface.
An `OrderedMap` has its entries sorted by key order. A `ReducedMap` is an
`OrderedMap` that memoizes partial combinations of sub-elements to support
efficient, incremental reduction of continuously mutating datasets.

### Cache implementations

`HashGenCacheMap` and `HashGenCacheSet` implement efficient hashed generational
caches that discard the least recently used value with the worst hit rate per
hash bucket.

### Assertions

The exported `Assert` interface provides a common API for constraint testing
and contract enforcement. The exported `assert` singleton provides a default
`Assert` implementation that throws `AssertException` on assert failure.
