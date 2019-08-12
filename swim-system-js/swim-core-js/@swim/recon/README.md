# @swim/recon

[![package](https://img.shields.io/npm/v/@swim/recon.svg)](https://www.npmjs.com/package/@swim/recon)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_recon.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

Recon is object notation with attributes, like if JSON and XML had a baby.
Attributes facilitate uniformly disambiguating polymorphic structures.  And
first-class language extensions for selectors, expressions, and functions make
Recon a highly expressive format for domain specific languages.  `@swim/recon`
is included as part of the [`@swim/core`](https://www.npmjs.com/package/@swim/core)
framework.

## Language Overview

### Primitives

Record Notation has six primitive datatypes: _text_, _data_, _num_, _bool_
_extant_, and _absent_.

#### Text Values

Text values take one of two forms: a quoted _string_, or an unquoted
_identifier_.

```recon
"string"
identifier
```

#### Data Values

Binary data encodes as a leading '%' symbol, followed by a base64 literal.

```recon
%AA==
```

#### Num Values

Numbers serialize as decimal literals.

```recon
-1
3.14
6.02e23
```

#### Bool Values

Booleans are represented by the `true` and `false` identifiers.

```recon
true
false
```

#### Extant Values

Extant symbolizes a thing that is defined, but which has no specific value.
Extant is represented by an empty token where a value is expected.

```recon
foo: # value of foo slot is extant
@bar # value of bar attr is extant
```

#### Absent Values

Absent represents something that does not exist.  Its only direct
representation in Record Notation is an empty document.

### Records

Record Notation has a single aggregate data type, called _record_.  Records
play the combined role of array and associative array.  Think of a record as
a partially keyed list—a sequence where some items may have keys, and other
items may lack keys.  An array is a record in which no items have keys.  An
associative array is a record in which every item has a key.  An object is a
record where every item has a text key.

The example below contains a record with two ordered items, first a "subject"
field with value "Greetings", then the unkeyed string "Hello, Earthlings!".

```recon
{ subject: "Greetings", "Hello, Earthlings!" }
```

Items in a record are separated by a single comma, a single semicolon,
or one or new lines. Newline separated records provide a clean syntax
for pretty-printed documents.

```recon
{
  subject: "Re: Greetings"
  "Hi Martians!"
}
```

Records support arbitrary values as slot keys.

```recon
{
  @planet Jupiter: {}
  @god Jupiter: {}
}
```

### Blocks

Top-level documents can omit the curly braces around their root record.
The content of a record, sans curly braces, is called a _block_.  When a block
contains only a single item, the value of the block reduces to the value of
the item it contains.  The example block below is equivalent to the example
record with curly braces above.

```recon
subject: "Re: Greetings"
"Hi Martians!"
```
### Markup

Square brackets denote _markup_.  Markup offers an inverted syntax for records,
with values embedded in text, as opposed to text embedded in records.  Markup
looks like this:

```recon
[Hello, @em[world]!]
```

Markup is really just syntactic sugar for records.  The above example expresses
the exact same structure as the example below.

```recon
{ "Hello, "; @em "world"; "!" }
```

Curly braces splice blocks into markup, lifting the enclosed block into the
markup's record.  The following records are equivalent.

```recon
[Answer: {42}.]
{ "Answer", 42, "." }
```

Square brackets lift nested markup into the enclosing record.  Make sure to
backslash escape square brackets if you want to include them verbatim.

```recon
[Say [what]?]
{ "Say ", "what", "?"}

[Say \[what\]?]
{ "Say [what]?" }
```

Sequential attributes within markup don't chain; each markup-embedded
attribute inserts a nested record.

```recon
[http@colon@slash@slash]
{ "http", @colon, @slash, @slash }
```

Attributes in markup can prefix curly brace enclosed blocks, as well as nested
markup.

```recon
[Goals: @select(max:2){fast,good,cheap}.]
{ "Goals: ", @select(max:2){fast,good,cheap}, "." }
```

Beware that whitespace inside markup is significant.  There can be no
whitespace between markup-embedded attributes and the blocks they're intended
to modify.  Notice how the single space added to the example below completely
changes its meaning, when compared to the previous example.

```recon
[Goals: @select(max:2) {fast,good,cheap}.]
{ "Goals: ", @select(max:2), " ", {fast,good,cheap}, "." }
```

### Attributes

The `@` sigil introduces an attribute.  Attributes call out key fields of
a record.  The markup `[Hello, @em[world]!]` further reduces to the form below.

```recon
{
  "Hello, "
  {
    "@em":
    "world"
  }
  "!"
}
```

Note that the `@em` field above has no explicit value.  Recon models
unspecified–but existent–values as _extant_.  We say that the record
`@em[world]` has an _extant attribute_ named `em`.

Of course, attributes can have specific associated values too.  Place attribute
parameters in parentheses following the attribute's name.

```recon
@answer(42)
@event("onClick")
```

The above attributes are structurally equivalent to:

```recon
{"@answer":42}
{"@event":"onClick"}
```

Attribute parentheses enclose a block, meaning attribute values construct an
implicit record when needed.  An example, with its desugared equivalent:

```recon
@img(src: "tesseract.png", width: 10, height: 10, depth: 10, time: -1)

{
  "@img": {
    src: "tesseract.png"
    width: 10
    height: 10
    depth: 10
    time: -1
  }
}
```

Attributes _modify_ adjacent values.  Modified values interpolate into the
record formed by their adjacent attributes.  Here are some examples of values
with prefix, postfix, and circumfix attributes:

```recon
@duration 30
30 @seconds
@duration 30 @seconds
@relative @duration 30 @seconds
```

The above attribute expressions desugar to the following records:

```recon
{ "@duration":, 30 }
{ 30, "@seconds": }
{ "@duration":, 30, "@seconds": }
{ "@relative":, "@duration":, 30, "@seconds": }
```

Modified records flatten into the record formed by their adjacent attributes.
So `@point{x:0,y:0}`, reduces to `{"@point":,x:0,y:0}`, not
`{"@point":,{x:0,y:0}}`.

### Selectors

TODO.

### Expressions

TODO.

### Functions

TODO.

## API Overview

`@swim/recon` uses [`@swim/structure`](https://www.npmjs.com/package/@swim/structure)
as its default abstract syntax tree.  Refer to the documentation for
`@swim/structure` to learn how to manipulate parsed Recon structures.

The `Recon` factory class provides static methods for parsing and serializing
Recon structures.  Use `Recon.parse` to parse a `@swim/structure` `Value` from
a string:

```typescript
swim.Recon.parse("[Welcome @a(href:'index.html')@em[home].]");
```

Use `Recon.toString` to serialize a structured `Value` to a Recon string:

```typescript
swim.Recon.toString(swim.Record.of("a", swim.Slot.of("b", 2), "c"));
// "{a,b:2,c}"
```

Use "Recon.toBlockString" to write a top-level block when serializing documents:

```typescript
swim.Recon.toBlockString(swim.Record.of("a", swim.Slot.of("b", 2), "c"));
// "a,b:2,c"
```

`@swim/recon` also adds extension methods to `@swim/structure` to make parsing
and serializing Recon more convenient.

The `Value.parseRecon` static method is an alias for `Recon.parse`.

```typescript
swim.Value.parseRecon("[Hello, @em[world]!]");
```

The `Item.toRecon` and `Item.toReconBlock` instance methods delegate to
`Recon.toString` and `Recon.toBlockString`, respectively.

```typescript
swim.Record.of("Hello, ", swim.Record.of(swim.Attr.of("em"), "world"), "!").toRecon();
// "[Hello, @em[world]!]"
```

Invoke `Item.toAny` to convert parsed Recon structures to plain old JavaScript
objects:

```typescript
swim.Value.parseRecon("1, 2, 3").toAny();
// [1, 2, 3]

swim.Value.parseRecon("a: 1, b: 2, c: 3").toAny();
// {"a": 1, "b": 2, "c": 3}

swim.Value.parseRecon("[Hello, @em[world]!]").toAny();
// ["Hello, ",{"@em":null,"$1":"world"},"!"]
```

`Recon` also provides methods to get composable
[`@swim/codec`](https://www.npmjs.com/package/@swim/codec) `Parser`s and
`Writer`s for low-level parsing and serialization needs, such as incremental
parsing out of arbitrary `Input` streams.

The exported `ReconParser` and `ReconWriter` classes can be extended to
directly generate and serialize alternative syntax trees, or to extend the
Recon language itself by overriding parse methods.  `ReconStructureParser` and
`ReconStructureWriter` provide the standard `@swim/structure`-based
`ReconParser` and `ReconWriter` implementations, with full support for Recon
selectors, expressions, and functions.

## Language Grammar

### Record Notation Grammar

Record Notation is the name of the minimal grammar for parsing Recon
structured values.

```
SP ::= #x20 | #x9

NL ::= #xA | #xD

WS ::= SP | NL

Char ::= [#x1-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]

NameStartChar ::=
  [A-Z] | "_" | [a-z] |
  [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] |
  [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] |
  [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] |
  [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]

NameChar ::=  NameStartChar | '-' | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]

MarkupChar ::= Char - ('\\' | '@' | '{' | '}' | '[' | ']')

StringChar ::= Char - ('"' | '\\' | '@' | '{' | '}' | '[' | ']' | '\b' | '\f' | '\n' | '\r' | '\t')

CharEscape ::= '\\' ('"' | '\\' | '/' | '@' | '{' | '}' | '[' | ']' | 'b' | 'f' | 'n' | 'r' | 't')

Base64Char ::= [A-Za-z0-9+/]

Block ::= WS* Slots WS*

Attr ::= '@' (Ident | String) ('(' Block ')')?

Slots ::= Slot SP* ((',' | ';' | NL) WS* Slots)?

Slot ::= BlockItem (SP* ':' SP* BlockItem?)?

BlockItem ::= BlockExpression SP* (Attr SP* BlockItem?)? | Attr SP* BlockItem? | Comment

InlineItem ::= Attr (Record | Markup)? | Record | Markup

Literal ::= Record | Markup | Data | Ident | String | Num | Bool | Selector

Record ::= '{' Block '}'

Markup ::= '[' (MarkupChar* | CharEscape | InlineItem)* ']'

Data ::= '%' (Base64Char{4})* (Base64Char Base64Char ((Base64Char '=') | ('=' '=')))?

Ident ::= NameStartChar NameChar*

String ::= ('"' (StringChar* | CharEscape)* '"') | ('\'' (StringChar* | CharEscape)* '\'')

Num ::= '-'? (([1-9] [0-9]*) | [0-9]) ('.' [0-9]+)? (('E' | 'e') ('+' | '-')? [0-9]+)?

Bool ::= 'true' | 'false'

Comment ::= '#' [^\n]*

# Extended by Recon Selectors grammar.
Selector ::=

# Extended by Recon Expressions grammar.
BlockExpression ::= Literal
```

### Recon Selectors Grammar

Recon Selectors extends the Record Notation grammar to support parsing
first-class selector expressions.

```
# Redefinition of Record Notation non-terminal.
Selector ::= '$' (Literal | '*:' | ':*' | '*' | '**' | '#' Integer | Filter)
             ('.' (Literal | '*:' | ':*' | '*' | '**') | '#' Integer | Filter | '(' Block ')')*

Filter ::= '[' BlockExpression ']'
```

### Recon Expressions Grammar

Recon Expressions extends the Record Notation grammar to support logical,
bitwise, algebraic, and functional expressions.

```
# Redefinition of Record Notation non-terminal.
BlockExpression ::= LambdaFunc

LambdaFunc ::= ConditionalOperator (SP* '=>' SP* ConditionalOperator)?

ConditionalOperator ::= OrOperator SP* ('?' SP* ConditionalOperator SP* ':' SP* ConditionalOperator)?

OrOperator ::= AndOperator SP* ('||' SP* AndOperator)*

AndOperator ::= BitwiseOrOperator SP* ('&&' SP* BitwiseOrOperator)*

BitwiseOrOperator ::= BitwiseXorOperator SP* ('|' SP* BitwiseXorOperator)*

BitwiseXorOperator ::= BitwiseAndOperator SP* ('^' SP* BitwiseAndOperator)*

BitwiseAndOperator ::= ComparisonOperator SP* ('&' SP* ComparisonOperator)*

ComparisonOperator ::= AttrExpression SP* (('<' | '<=' | '==' | '>=' | '>') SP* AttrExpression)?

AttrExpression ::= AdditiveOperator SP* (Attr SP* AttrExpression?)? | Attr SP* AttrExpression?

AdditiveOperator ::= MultiplicativeOperator SP* (('+' | '-') SP* MultiplicativeOperator)*

MultiplicativeOperator ::= PrefixOperator SP* (('*' | '/' | '%') SP* PrefixOperator)*

PrefixOperator ::= InvokeOperator SP* | ('!' | '~' | '-' | '+') SP* PrefixOperator

InvokeOperator ::= Primary ('(' Block ')')*

Primary ::= Literal | '(' BlockExpression (',' BlockExpression)* ')'
```

## Installation

### npm

For an npm-managed project, `npm install @swim/recon` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/recon/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/recon/lib/main`.  And a pre-built UMD script can be found in
`node_modules/@swim/recon/dist/main/swim-recon.js`.

### Browser

Web applications can load `swim-core.js`, which comes bundled with the
`@swim/recon` library, directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/recon` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as recon from "@swim/recon";
```

### CommonJS/Node.js

`@swim/recon` can also be used as a CommonJS in Node.js applications.

```javascript
var recon = require("@swim/recon");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds the `@swim/recon`
library exports to the global `swim` namespace.
