# [![Swim](https://docs.swimos.org/readme/breach-marlin-blue-wide.svg)](https://www.swimos.org) Swim Structure Library

The Swim Structure library implements a generic structured data model that
is compatible with JSON, XML, and other data languages. Swim structures have
first class support for XPath/JSONPath-style selectors, as well as operator
syntax trees, and lambda functions.

## Overview

Think of Swim structures as a generic abstract syntax tree that can represent
many structured data models, including parsed JSON, parsed XML, parsed Recon,
parsed Protocol Buffers, and more. In addition to structured data models,
Swim structures have generic syntax trees for selector languages, like XPath,
JSONPath, and Recon selectors. Swim structures also provide generic syntax
trees for algebraic, logical, bitwise, and function invocation operators, as
well as syntax trees for lambda function definitions. An `Interpreter` is
provided for evaluating selectors, operators, and function invocations.

Parsers from source languages to Swim structures are provided by separate
packages. The [Swim Recon][recon] library implements a parser and serializer
for Recon, Recon selectors, and Recon expressions.

### Data Model

The heart of Swim structures is a uniform structured data model. Swim uses
an abstract data model to decouple itself from the irregularities and
limitations of common data formats, such as JSON or XML.

To illuminate the complexity and limitations that Swim structures were
designed to solve, let's first consider the data models of JSON and XML.

JSON's data model consists of four primitive types: `string`, `number`,
`boolean`, and `null`; and two composite types: `object`, and `array`. Note
that because JSON has two distinct composite types, its data model doesn't
produce uniform tree structures. JSON also lacks a consistent way to
disambiguate polymorphic structures. And JSON's lack of expressiveness leads
to frequent use of textual microformats, which require additional parsing steps.

XML's data model consists of one quasi-primitive type: `text` nodes, which
may internally compose out-of-band entity references; and one composite type:
`element`. Note that XML does not produce uniform tree structures either, due
to the fact that elements have both child nodes, and associated attributes.
And because of its textual nature, XML leads to profuse use of ad hoc string
microformats. Rather than natively implemented a structured type system, XML
layers on various nominally typed schema languages.

Swim structures implement a uniform tree data model that is a superset of
both the JSON and XML data models. The Swim structured data model has six
primitive types: `data`, `text`, `num`, `bool`, `extant`, and `absent`; two
field types: `attr`, and `slot`; and a single composite type: `record`.

Having only one composite type allows every compound data structure to be
treated as a uniform tree. The `record` type effectively behaves like a
partially-keyed list, enabling it to model both objects and arrays. The `attr`
field type provides a consistent polymorphic disambiguation mechanism, similar
to—but more uniform and expressive than—XML tags. The `slot` field type models
object properties as distinct child items that happen to have a key. But
unlike JSON object keys, `slot` keys are not restricted to string values.

### Structures

<img src="https://docs.swimos.org/readme/item-family.svg" alt="Item Family" align="right">

At the root of the Swim structures type hierarchy is the `Item` class, which
defines an algebraic data type for representing and manipulating structured data.
`Item` provides many methods for operating on structured values, most of which
are closed over the `Item` type, meaning they always return other instances of
`Item`. This closure of operations over the `Item` type make it safe and
expressive to traverse, transform, and convert arbitrary data structures,
without excessive conditional logic to type check and validate structures
obtained from external sources.

Every `Item` is either a `Field` or a `Value`. Every `Field` is either an
`Attr` or a `Slot`. And every `Value` is either a `Record`, `Data`, `Text`,
`Num`, `Bool`, `Extant`, or `Absent`. Think of `Item` as analogous to the set
of all JSON values, with the inclusion of object fields as first class elements.

A `Field` represents a key-value pair, where both the key and value are of type
`Value`. An `Attr` is a discriminated kind of `Field` whose key is always of
type `Text`. Every `Field` that is not explicitly an `Attr` is a `Slot`.
Think of a `Slot` as a field of a JSON object, or as an attribute of an XML tag.
Think of an `Attr` like an XML tag, where the key of the `Attr` is the tag name,
and the value of the `Attr` is a `Record` containing the element's attributes.

Every `Item` that is not a `Field` is a `Value`. A `Value` can either be one
of four primitive value types: `Data`, `Text`, `Num`, or `Bool`; one of two
unit types: `Extant`, or `Absent`; or the composite type: `Record`. Think of
a `Value` as representing an arbitrary data structure.

A `Data` object represents opaque binary data; it wraps a JavaScript
`Uint8Array`. A `Text` object represents a Unicode string, and wraps a
primitive JavaScript `string`. A `Num` object represents a numeric value,
encapsulating a primitive JavaScript `number`. A `Bool` object represents a
boolean value, wrapping a primitive JavaScript `boolean`.

There are two unit types: `Extant`, and `Absent`. `Extant` represents a thing
that exists, but has no value; sort of like JavaScript's `null` value, but a
valid object on which you can invoke methods. `Absent` represents something
that does not exist; similar to JavaScript's `undefined` value, but a valid
instance of `Item`.

A `Record` is a simple container of `Item` members, and is the only composite
structure type. A `Record` containing only `Field` members is analogous to a
JSON object—though unlike JSON, its keys are not restricted to strings. A
`Record` containing only `Value` members is similar to a JSON array. A `Record`
with a leading `Attr` bears resemblance to an XML element. And a `Record` with
a mixture of `Field` and `Value` members acts like a partially keyed list.

### Expressions

<img src="https://docs.swimos.org/readme/expression-family.svg" alt="Expression Family" align="right">

Beyond representing static data structures, Swim structures can also model
dynamic data structures, expressed using `Selector`, `Operator`, and `Func`
extensions to the structured `Value` type. All dynamic values extend the
abstract `Expression` class. `Expression` trees treat code as just another
data type.

Invoking the `evaluate` method of any `Item` returns a new `Item` with all
nested expressions interpreted in lexical order and scope. The `substitute`
method partially evaluates an `Item`, interpreting only the sub-expressions
that contain no unresolveable selectors.

The [Swim Dataflow][dataflow] library implements a compiler from Swim
structure expressions to live-updated structures that automatically recompute
themselves when any transitively dependent selector changes.

#### Selectors

A `Selector` is an `Expression` that defines a filter function, which, given
a selection scope, evaluates to some subset of items contained in that scope.
Each `Selector` represents a filter operation, followed by a subselection,
defined by a chained `then` `Selector`. A `Selector` expression thus consists
of a sequence of filter steps, terminating with the identity selector.

The following `Selector` expressions are supported:

- **`IdentitySelector`** – selects the selection scope.
- **`GetSelector`** – selects the `Value` associated with some key for each
  `Field` in the selection scope.
- **`GetAttrSelector`** – selects the `Value` associated with some key for each
  `Attr` in the selection scope.
- **`GetItemSelector`** – selects the `Item` at some index of each `Record` in
  the selection scope.
- **`KeysSelector`** – selects the key of each `Field` in the selection scope.
- **`ValuesSelector`** – selects the value of each `Field` in the selection
  scope, as well as each `Value` in the selection scope.
- **`ChildrenSelector`** – selects the members of each `Record` in the
  selection scope.
- **`DescendantsSelector`** – recursively selects the members of each `Record`
  in the selection scope.
- **`FilterSelector`** – selects each `Item` in the selection scope for which
  some expression, evaluated in the current selection scope, returns a truthy
  value.
- **`LiteralSelector`** – selects the result of some expression, evaluated in
  the current selection scope.

#### Operators

An `Operator` is an `Expression` that performs an arithmetic, logical, bitwise,
or comparison operation on its operand expressions. An `Operator` expression
evaluates to `Absent` when its operands cannot be coerced to a suitable type.
The following `Operator` expressions are provided:

- **`ConditionalOperator`** – ternary operator that evaluates its `ifTerm`, and
  if truthy, evaluates its `thenTerm`, and if falsey, evaluates its `elseTerm`.
- **`OrOperator`** – binary operator that evaluates its first operand,
  and if falsy, evaluates its second oprand.
- **`AndOperator`** – binary operator that evaluates its first operand,
  and if truthy, evaluates its second operand.
- **`BitwiseOrOperator`** – binary operator that evaluates to the bitwise
  inclusive OR of its integer operands.
- **`BitwiseXorOperator`** – binary operator that evaluates to the bitwise
  exclusive OR of its integer operands.
- **`BitwiseAndOperator`** – binary operator that evaluates to the bitwise
  AND of its integer operands.
- **`LtOperator`** – binary operator that evaluates to `true` if its first
  operand is strictly less than its second operand, and otherwise evaluates
  to `Absent`.
- **`LeOperator`** – binary operator that evaluates to `true` if its first
  operand is less than or equal to its second operand, and otherwise evaluates
  to `Absent`.
- **`EqOperator`** – binary operator that evaluates to `true` if its first
  operand is structurally equal to its second operand, and otherwise evaluates
  to `Absent`.
- **`NeOperator`** – binary operator that evaluates to `true` if its first
  operand is not structurally equal to its second operand, and otherwise
  evaluates to `Absent`.
- **`GeOperator`** – binary operator that evaluates to `true` if its first
  operand is greater than or equal to its second operand, and otherwise
  evaluates to `Absent`.
- **`GtOperator`** – binary operator that evaluates to `true` if its first
  operand is strictly greater than its second operand, and otherwise evaluates
  to `Absent`.
- **`PlusOperator`** – binary operator that evaluates to the sum of its numeric
  operands.
- **`MinusOperator`** – binary operator that evaluates to the difference of its
  numeric operands.
- **`TimesOperator`** – binary operator that evaluates to the product of its
  numeric operands.
- **`DivideOperator`** – binary operator that evaluates to the division of its
  numeric operands.
- **`ModuloOperator`** – binary operator that evaluates to the modulus of its
  numeric operands.
- **`NotOperator`** – unary operator that evaluates to the logical negation of
  its operand.
- **`BitwiseNotOperator`** – unary operator that evaluates to the bitwise
  complement of its integer operand.
- **`NegativeOperator`** – unary operator that evaluates to the negation of its
  numeric operand.
- **`PositiveOperator`** – unary operator that evaluates to its numeric operand.
- **`InvokeOperator`** – operator that invokes its evaluates `func` operand
  with its unevaluated `args` operand.

#### Functions

A `Func` is an `Expression` with an `invoke` method that takes an argument
`Value`, an `Interpreter`, and an optional `InvokeOperator`, and returns an
`Item`. A `Func` may take a `Record` as its argument in order to support
multiple parameters. A `Func` is usually invoked with unevaluated arguments;
a `Func` can choose to eagerly evaluate its arguments, or to operate like a
macro on the syntax trees of its arguments.

The following builtin `Func` types are implementated:

- **`LambdaFunc`** – an anonymouse function that, when invoked, evaluates its
  `template` expression with its `bindings` identifiers in scope and bound to
  its eagerly evaluated arguments.
- **`BridgeFunc`** – a function implemented in JavaScript.

### Interpreters

An `Interpreter` is the context in which an `Expression` is evaluated. It
maintains a stack of lexical selection scopes, observes all evaluation steps,
and enforces execution limits.

### Forms

A `Form` defines a conversion between a structural type, and some nominal
JavaScript type. The `mold` method converts a nominal JavaScript type to an
`Item`. And the `cast` method converts an `Item` to a nominal JavaScript type,
if possible.

The `unit` method optionally returns a default value for the nominal JavaScript
type. The `tag` method optionally returns a discriminating `Attr` key string,
which, if defined, can be used to optimize polymorphic `cast` operations.

The Swim Structure library implements standard forms for builtin JavaScript types.

[dataflow]: swim-core/@swim/dataflow
[recon]: swim-core/@swim/recon
