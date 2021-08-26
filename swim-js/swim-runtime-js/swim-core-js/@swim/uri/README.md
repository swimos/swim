# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim URI Library

The Swim URI library implements a rich object model for working with Uniform
Resource Identifiers and URI subcomponents, including an efficient and safe
codec for parsing and writing compliant URI strings. Comprehensive APIs for
paths and queries simplify deconstruction and manipulation of parsed URI objects.

## Overview

Swim URI models each URI component as an immutable class, with rich methods
for manipulating and destructuring the component. The `Uri` class combines a
`UriScheme`, `UriAuthority`, `UriPath`, `UriQuery`, and `UriFragment` into a
complete model of a URI. The `UriAuthority` class composes a `UriUser`,
`UriHost`, and `UriPort` into a standalone model of the authority component of
a URI.

The `UriPath` class represents URI paths as an immutable linked list, making it
efficient to incrementally deconstruct. The `UriQuery` class uses a similar
linked list structure to represent query parameters, while providing a
convenient `Map`-like API.

The `Uri` class has an expressive API for transforming URI subcomponents. And
provides standards-compliant methods to resolve and unresolve URIs relative to
base URIs.

All Swim URI classes are immutable, which facilitates caching and instance
sharing. All manipulation methods return a new URI component, instead of
mutating the receiver. URI classes are also typically used non-nullably,
enabling fluent API use without pervasive `null` checks. Undefined URI
components are modeled as particular instances of their respective component
classes for which an `isDefined` method returns `false`, rather than as `null`
or `undefined` JavaScript values.

Swim URI implements [Swim Codec][codec]-based `Parser`s and `Writer`s for
efficiently and safely decoding and encoding URI strings. Aggressive internal
caching and memoization minimizes runtime overhead, without compromising the API.

### Uri

The `Uri.parse` static method parses an encoded URI string into a structured
`Uri` object. The `Uri.toString` instance method reverses the process,
returning a properly URI-encoded string. `Uri.toString` is memoized—repeated
calls return the same string instance–making it efficient to store references
to structured `Uri` objects even when they're frequently converted to strings.

```typescript
const uri = Uri.parse("http://www.example.com/test?foo&bar=baz#qux");
// Uri.parse("http://www.example.com/test?foo&bar=baz#qux")

uri.toString();
// "http://www.example.com/test?foo&bar=baz#qux"
```

Use the `Uri.fromAny` static method to coerce a plain old JavaScript object,
of type `UriInit`, or an encoded URI string, to a structured `Uri` instance.
Use the `Uri.toAny` instance method to convert a `Uri` instance into a plain
old JavaScript object.

```typescript
Uri.fromAny({
  scheme: "http",
  host: "example.com",
  path: ["/", "index.html"],
  query: {token: "1234"},
  fragment: "toc"
});
// Uri.parse("http://example.com/index.html?token=1234#toc")

Uri.parse("http://user:pass@127.0.0.1:8080/foo?a=1&b=2#bar").toAny();
// {
//   scheme: "http",
//   username: "user",
//   password: "pass",
//   host: "127.0.0.1",
//   port: 8080,
//   path: ["/", "foo"],
//   query: {a: "1", b: "2"},
//   fragment: "bar"
// }
```

The `Uri.empty` static method returns a singleton `Uri` instance with undefined
scheme, authority, path, query, and fragment components. Keep in mind that
undefined URI components are valid instances of their respective component
classes.

```typescript
Uri.empty().scheme;
// UriScheme.undefined()

Uri.empty().authority;
// UriAuthority.undefined()

Uri.empty().path;
// UriPath.empty()

Uri.empty().query;
// UriQuery.undefined()

Uri.empty().fragment;
// UriFragment.undefined()
```

Use the `Uri.create` static method to construct a new `Uri` from a `UriScheme`,
`UriAuthority`, `UriPath`, `UriQuery`, and `UriFragment`, with `undefined` and
ommitted arguments replaced by their respective undefined component instances.

Use the `Uri.scheme`, `Uri.authority`, `Uri.user`, `Uri.host`, `Uri.port`,
`Uri.path`, `Uri.query`, and `Uri.fragment` static methods to construct new
`Uri` instances with a single defined component. Strings passed to these
factory methods will be treated as unencoded URI components. `Uri.path` treats
string arguments as encoded URI path components, and accepts multiple arguments
for safe and convenient path interpolation. `Uri.query` also accepts a hash of
key-value query parameters.

```typescript
Uri.scheme("warp");
// Uri.parse("warp:")

Uri.authority("user:pass@example.com:80");
// Uri.parse("//user:pass@example.com:80")

Uri.path("/foo/bar");
// Uri.parse("%2ffoo%2fbar")

Uri.path("/", "foo", "/", "bar");
// Uri.parse("/foo/bar")

Uri.query("a=1?b=2");
// Uri.parse("?a=1?b=2")

Uri.query({eeny: "meeny", miny: "moe"});
// Uri.parse("?eeny=meeny&miny=moe")

Uri.fragment("anchor");
// Uri.parse("#anchor")
```

To construct a `Uri` from an encoded URI component, use the `Uri.schemePart`,
`Uri.authorityPart`, `Uri.userPart`, `Uri.hostPart`, `Uri.portPart`,
`Uri.pathPart`, `Uri.queryPart`, and `Uri.fragmentPart` static methods.
These methods only accept URI-encoded string arguments; the `Part` suffix
helps distinguish the use of encoded vs. unencoded component strings.

```typescript
Uri.pathPart("/foo/bar");
// Uri.parse("/foo/bar")
```

Use the `Uri.scheme`, `Uri.authority`, `Uri.user`, `Uri.host`, `Uri.port`,
`Uri.path`, `Uri.query`, and `Uri.fragment` instance methods access and update
URI subcomponents. To access and update URI-encoded string subcomponents, use
the `Uri.schemePart`, `Uri.authorityPart`, `Uri.userPart`, `Uri.hostPart`,
`Uri.portPart`, `Uri.pathPart`, `Uri.queryPart`, and `Uri.fragmentPart`
instance methods. Because `Uri` instances are immutable, update methods
return a copy of the `Uri` with the updated subcomponent.

Here are some examples showing how to access `Uri` subcomponents:

```typescript
Uri.parse("http://example.com").scheme();
// UriScheme.parse("http")

Uri.parse("http://user:pass@example.com:80").authority();
// UriAuthority.parse("user:pass@example.com:80")

Uri.parse("http://user:pass@example.com:80").user();
// UriUser.parse("user:pass")

Uri.parse("http://user:pass@example.com:80").host();
// UriHost.create("example.com")

Uri.parse("http://user:pass@example.com:80").port();
// UriPort.create(80)

Uri.parse("http://example.com/test?foo&bar=baz#qux").path();
// UriPath.parse("/test")

Uri.parse("http://example.com/test?foo&bar=baz#qux").query();
// UriQuery.parse("foo&bar=baz")

Uri.parse("http://example.com/test?foo&bar=baz#qux").fragment();
// UriFragment.parse("qux")
```

Here are some examples showing how to update `Uri` subcomponents.

```typescript
Uri.parse("http://example.com").scheme("https");
// Uri.parse("https://example.com")

Uri.parse("http://example.com").authority("user@example.com:80");
// Uri.parse("http://user@example.com:80")

Uri.parse("http://example.com").user("user:pass");
// Uri.parse("http://user:pass@example.com")

Uri.parse("http://example.com").host("www.example.com");
// Uri.parse("http://www.example.com")

Uri.parse("http://example.com").port(80);
// Uri.parse("http://example.com:80")

Uri.parse("http://example.com").path("/");
// Uri.parse("http://example.com/")

Uri.parse("http://example.com").path("/", "foo/bar");
// Uri.parse("http://example.com/foo%2fbar")

Uri.parse("http://example.com").query("foo&bar=baz");
// Uri.parse("http://example.com?foo&bar=baz")

Uri.parse("http://example.com").fragment("toc");
// Uri.parse("http://example.com#toc")
```

Use the `Uri.appendedPath` and `Uri.prependedPath` instance methods to append
or prepend a sequence of unencoded path components to the existing URI path.
Use the `Uri.appendedSlash` and `Uri.prependedSlash` instance methods to append
or prepend a single slash to the existing path. And use the
`Uri.appendedSegment` and `Uri.prependedSegment` instance methods to append or
prepend a single unencoded path segment. Note that adjacent path segments are
automatically separated by slashes, as required.

```typescript
Uri.parse("bar").appendedPath("/", "baz");
// Uri.parse("bar/baz")

Uri.parse("bar").appendedPath("baz", "qux");
// Uri.parse("bar/baz/qux")

Uri.parse("bar").prependedPath("foo", "/");
// Uri.parse("foo/bar")

Uri.parse("bar").prependedPath("/", "foo");
// Uri.parse("/foo/bar")

Uri.parse("bar").appendedSlash();
// Uri.parse("bar/")

Uri.parse("bar").prependedSlash();
// Uri.parse("/bar")

Uri.parse("bar").appendedSegment("http://example.com/foo/?q#f");
// Uri.parse("bar/http:%2f%2fexample.com%2ffoo%2f%3fq%23f")

Uri.parse("bar").prependedSegment("/");
// Uri.parse("%2f/bar")
```

Use the `Uri.updatedQuery` instance method to update a query parameter,
inserting a new parameter if the key is not currently defined. Use the
`Uri.removedQuery` instance method to remove a parameter from the query,
if defined. The `Uri.appendedQuery` and `Uri.prependedQuery` instance
methods unconditionally append or prepend query parameters. A `null` key
in a query parameter indicates that the parameter is a literal string value,
i.e. it contains no `'='` sign in its encoded form.

```typescript
Uri.parse("?b=1&c=2").updatedQuery("b", "beta");
// Uri.parse("?b=beta&c=2")

Uri.parse("?b=1&c=2").updatedQuery("c", "charlie");
// Uri.parse("?b=1&c=charlie")

Uri.parse("?b=1&c=2").updatedQuery("d", "delta");
// Uri.parse("?b=1&c=2&d=delta")

Uri.parse("?b=1&c=2").removedQuery("b");
// Uri.parse("?c=2")

Uri.parse("?b=1&c=2").removedQuery("b").removedQuery("c");
// Uri.empty()

Uri.parse("?b=1&c=2").appendedQuery("c", "charlie");
// Uri.parse("?b=1&c=2&c=charlie")

Uri.parse("?b=1&c=2").appendedQuery("delta");
// Uri.parse("?b=1&c=2&delta")

Uri.parse("?b=1&c=2").prependedQuery("b", "beta");
// Uri.parse("?b=beta&b=1&c=2")

Uri.parse("?b=1&c=2").prependedQuery("alpha");
// Uri.parse("?alpha&b=1&c=2")
```

Use the `Uri.resolve` instance method to resolve a relative URI argument
against a base URI. Use the `Uri.unresolve` instance method to obatin the
relative components of a URI argument with respect to a base URI.

```typescript
Uri.parse("http://example.com/foo/").resolve("bar/baz");
// Uri.parse("http://example.com/foo/bar/baz")

Uri.parse("http://example.com/foo/").resolve("/bar/baz");
// Uri.parse("http://example.com/bar/baz")

Uri.parse("http://example.com/foo/").unresolve("http://example.com/foo/bar/baz");
// Uri.parse("bar/baz")
```

### UriScheme

The `UriScheme` class wraps a valid URI scheme name, giving it a meaningful
type, and a consistent set of methods. The `UriScheme.undefined` static method
returns the singleton undefined `UriScheme` instance. The `UriScheme.create`
static method returns a cached `UriScheme` instance with the given scheme name.
The `UriScheme.parse` static method parses a URI scheme component to ensure it
is valid.

The `UriScheme.isDefined` instance method returns `false` if the `UriScheme`
instance represents an undefined URI scheme component. The `UriScheme.name`
instance method returns the underlying scheme name, or the empty string if the
scheme is not defined. The `UriScheme.toAny` method returns the underlying
scheme name, or `undefined` if the scheme is not defined.

```typescript
UriScheme.undefined().isDefined();
// false

UriScheme.create("http").isDefined();
// true

UriScheme.parse("my_scheme");
// throws exception

UriScheme.create("https").name;
// "name"

UriScheme.undefined().name;
// ""

UriScheme.undefined().toAny()
// undefined
```

### UriAuthority

The `UriAuthority` class combines a `UriUser`, `UriHost`, and `UriPort`,
modeling the authority component of a URI. The `UriAuthority.parse` static
method parses an encoded URI authority into a structured `UriAuthority` object.
The `UriAuthority.toString` instance method returns a memoized URI-encoded
authority string.

```typescript
const authority = UriAuthority.parse("user:pass@example.com:80");
// UriAuthority.parse("user:pass@example.com:80")

authority.toString();
// "user:pass@example.com:80"
```

Use the `UriAuthority.fromAny` static method to coerce a plain old JavaScript
object, of type `UriAuthorityInit`, or a URI-encoded authority string, to a
structured `UriAuthority` instance. Use the `UriAuthority.toAny` instance
method to convert a `UriAuthority` instance into a plain old JavaScript object.

```typescript
UriAuthority.fromAny({
  username: "user",
  password: "pass",
  host: "example.com",
  port: 80
});
// UriAuthority.parse("user:pass@example.com:80")

UriAuthority.parse("user:pass@example.com:80").toAny();
// {
//   username: "user",
//   password: "pass",
//   host: "example.com",
//   port: 80
// }
```

The `UriAuthority.undefined` static method returns a singleton `UriAuthority`
instance with undefined user, host, and port components.

```typescript
UriAuthority.undefined().user;
// UriUser.undefined()

UriAuthority.undefined().host;
// UriHost.undefined()

UriAuthority.undefined().port;
// UriPort.undefined()
```

Use the `UriAuthority.create` static method to construct a new `UriAuthority`
from a `UriUser`, `UriHost`, and `UriPort`, with `undefined` and ommitted
arguments replaced by their respective undefined component instances.

The `UriAuthority.isDefined` instance method returns `false` if the
`UriAuthority` instance represents an undefined URI authority component.

```typescript
UriAuthority.undefined().isDefined();
// false

UriAuthority.parse("example.com").isDefined();
// true
```

Use the `UriAuthority.user`, `UriAuthority.host`, and `UriAuthority.port`
static methods to construct new `UriAuthority` instances with a single defined
component. Strings passed to these factory methods will be treated as
unencoded authority components.

```typescript
UriAuthority.user("user:pass");
// UriAuthority.parse("user:pass@")

UriAuthority.host("example.com");
// UriAuthority.parse("example.com")

UriAuthority.port(8080);
// UriAuthority.parse(":8080")
```

Use the `UriAuthority.host`, `UriAuthority.user`, and `UriAuthority.port`,
instance methods access and update authority subcomponents. Because
`UriAuthority` instances are immutable, update methods return a copy of the
`UriAuthority` with the updated subcomponent.

Here are some examples showing how to access `UriAuthority` subcomponents:

```typescript
UriAuthority.parse("user:pass@example.com:80").user;
// UriUser.parse("user:pass")

UriAuthority.parse("user:pass@example.com:80").host;
// UriHost.create("example.com")

UriAuthority.parse("user:pass@example.com:80").port;
// UriPort.create(80)
```

Here are some examples showing how to update `UriAuthority` subcomponents.

```typescript
UriAuthority.parse("user:pass@example.com:80").withUser(null);
// UriAuthority.parse("example.com:80")

UriAuthority.parse("user:pass@example.com:80").withHost("www.example.com");
// UriAuthority.parse("user:pass@www.example.com:80")

UriAuthority.parse("user:pass@example.com:80").withPort(8080);
// UriAuthority.parse("user:pass@example.com:8080")
```

#### UriUser

The `UriUser` class wraps a username and optional password string. The
`UriUser.undefined` static method returns a singleton `UriUser` with an
undefined username and password. The `UriUser.create` static method constructs
a new `UriUser` from a username and optional password string. The
`UriUser.fromAny` static method coerces a plain old JavaScript object, of type
`UriUserInit`, or a URI-encoded user string, to a structured `UriUser` instance.

```typescript
UriUser.fromAny({username: "user", password: "pass"});
// UriUser.parse("user:pass")

UriUser.parse("user:pass").toAny();
// {username: "user", password: "pass"}
```

The `UriUser.isDefined` instance method returns `false` if the `UriUser`
instance represents an undefined URI user component.

```typescript
UriUser.undefined().isDefined();
// false

UriUser.parse("user:pass").isDefined();
// true
```

Use the `UriUser.username` and `UriUser.password` methods to access and update
user subcomponents.

```typescript
UriUser.parse("user:pass").username;
// "user"

UriUser.parse("user:pass").password;
// "pass"

UriUser.parse("user:pass").withUsername("multi");
// UriUser.parse("multi:pass")

UriUser.parse("user:pass").withPassword("secret");
// UriUser.parse("user:secret")
```

#### UriHost

The `UriHost` class models a URI host component, which is either a DNS name,
an IPv4 address, an IPv6 address, or an undefined host component. The
`UriHost.parse` static method parses a URI-encoded host component to a strongly
typed UriHost instance. The `UriHost.hostname` static method constructs a new
`UriHost` from a host name string. The `UriHost.ipv4` static method constructs
a new `UriHost` from an IPv4 address. And the `UriHost.ipv6` static method
constructs a new `UriHost` from an IPv6 address.

```typescript
UriHost.parse("example.com");
// UriHost.hostname("example.com")

UriHost.parse("127.0.0.1");
// UriHost.ipv4("127.0.0.1")

UriHost.parse("[::1]");
// UriHost.ipv6("::1")
```

The `UriHost.undefined` static method returns the singleton undefined `UriHost`
instance. And the `UriHost.isDefined` instance method returns `false` if the
`UriHost` instance represents an undefined URI host component.

```typescript
UriHost.undefined().isDefined();
// false

UriHost.parse("example.com").isDefined();
// true
```

#### UriPort

The `UriPort` class wraps a network port number, giving it a meaningful type,
and a consistent set of methods. The `UriPort.undefined` static method returns
the singleton undefined `UriPort` instance. The `UriPort.create` static method
returns a cached `UriPort` instance with the given port number. And the
`UriPort.parse` static method parses a URI port number.

The `UriPort.isDefined` instance method returns `false` if the `UriPort`
instance represents an undefined URI port number. The `UriPort.number`
instance method returns the underlying port number, or zero if the port
is not defined.

```typescript
UriPort.undefined().isDefined();
// false

UriPort.create(80).isDefined();
// true

UriPort.parse("80").number;
// 80

UriPort.undefined().number;
// 0
```

### UriPath

The `UriPath` class models the path component of a URI as an immutable linked
list of segments and slashes. This linked list structure makes it efficient to
incrementally deconstruct URI paths by prefix. Despite being implemented as a
linked list, `UriPath` provides a familiar array-like interface.

The `UriPath.parse` static method parses a URI-encoded path string to a
structured `UriPath` list. The `UriPath.of` static method constructs a
`UriPath` instance from a sequence of unencoded URI path components. The
`UriPath.toString` instance method returns a memoized URI-encoded path string.

```typescript
const path = UriPath.parse("/foo/bar");
// UriPath.parse("/foo/bar")

path.toString();
// "/foo/bar"

UriPath.of("/", "foo/bar");
// UriPath.parse("/foo%2fbar")
```

Use the `UriPath.fromAny` static method to construct a `UriPath` from an array
of unencoded string components, or from a URI-encoded path string. Use the
`UriPath.toAny` instance method to convert a `UriPath` list to an array of
unencoded string components.

```typescript
UriPath.fromAny(["/", "foo", "/", "bar"]);
// UriPath.parse("/foo/bar")

UriPath.parse("/foo/bar%2fbaz").toAny();
// ["/", "foo", "/", "bar/baz"]
```

The `UriPath.head` instance method returns the first component of the path.
The `UriPath.tail` instance method returns the `UriPath` containing all but the
first component of the path. The `UriPath.empty` static method returns the
singleton empty `UriPath` instance, which serves as the nil element of all
`UriPath` linked lists.

```typescript
UriPath.parse("/index.html").head();
// "/"

UriPath.parse("/index.html").tail();
// UriPath.parse("index.html")

UriPath.parse("/index.html").tail().head();
// "index.html"

UriPath.parse("/index.html").tail().tail();
// UriPath.empty()
```

The `UriPath.length` property returns the number of components in the path.
The `UriPath.get` instance method returns the component at a given index.

```typescript
UriPath.parse("a/b/c").length;
// 5

UriPath.parse("a/b/c").get(2);
// "b"
```

The `UriPath.appended` and `UriPath.prepended` instanced methods append or
prepend a sequence of unencoded path components to the path, inserting slashes
as required to produce a valid path.

```typescript
UriPath.parse("c").appended("/", "d");
// UriPath.parse("c/d")

UriPath.parse("c").appended("d", "e");
// UriPath.parse("c/d/e")

UriPath.parse("c").prepended("b", "/");
// UriPath.parse("b/c")

UriPath.parse("c").prepended("a", "b");
// UriPath.parse("a/b/c")
```

The `UriPath.isDefined` instance method returns `true` if the path is non-empty,
whereas `UriPath.isEmpty` instance method returns `true` if the path is empty.
The `UriPath.isAbsolute` instance method returns `true` if and only if the path
begins with a slash component. The `UriPath.isRelative` instance method
returns `true` if the path does not begin with a slash component.

```typescript
UriPath.empty().isDefined();
// false

UriPath.parse("/").isDefined();
// true

UriPath.empty().isEmpty();
// true

UriPath.parse("/").isEmpty();
// false

UriPath.parse("/").isAbsolute();
// true

UriPath.parse("foo").isAbsolute();
// false

UriPath.parse("foo").isRelative();
// true

UriPath.empty().isRelative();
// true
```

The `UriPath.name` method gets or updates the last segment of a path.

```typescript
UriPath.parse("/foo/index.html").name;
// "index.html"

UriPath.parse("/foo/").name;
// ""

UriPath.parse("/foo/index.html").withName("script.js");
// UriPath.parse("/foo/script.js")

UriPath.parse("/foo/").withName("script.js");
// UriPath.parse("/foo/script.js")
```

The `UriPath.parent` instance method returns the directory that contains the
path. The `UriPath.base` instance method truncates any trailing segment off
the path.

```typescript
UriPath.parse("/foo/bar").parent();
// UriPath.parse("/foo/")

UriPath.parse("/foo/bar/").parent();
// UriPath.parse("/foo/")

UriPath.parse("/foo/bar").base();
// UriPath.parse("/foo/")

UriPath.parse("/foo/bar/").base();
// UriPath.parse("/foo/bar/")
```

The `UriPath.isSubpathOf` instance method returns `true` if the path argument
is a prefix of the path.

```typescript
UriPath.parse("/a/b/c").isSubpathOf("/a/b");
// true

UriPath.parse("/x/b/c").isSubpathOf("/a/b");
// false
```

#### UriPathBuilder

The `UriPathBuilder` class provides an efficient way to incrementally construct
`UriPath` objects by appending path components. `UriPathBuilder` implements
the [Swim Util][util] `Builder` interface, enabling path components to be
`push`ed onto the end of the path, like an array. Appends to `UriPathBuilder`
instances take constant time.

The `UriPath.builder` method returns a new `UriPathBuilder` instance.

### UriQuery

The `UriQuery` class models the query component of a URI as an immutable linked
list of query parameters. This linked list structure makes it efficient to
incrementally deconstruct URI queries. Despite being implemented as a linked
list, `UriQuery` provides a familiar Map-like interface for accessing query
parameters by key.

The `UriQuery.parse` static method parses a URI-encoded query string to a
structured `UriQuery` instance. The `UriQuery.toString` instance method
returns a memoized URI-encoded query string.

```typescript
const query = UriQuery.parse("foo&bar=baz");
// UriQuery.parse("foo&bar=baz")

query.toString();
// "foo&bar=baz"
```

Use the `UriQuery.fromAny` static method to construct a `UriQuery` from a plain
old JavaScript object containing key-value query parameters, or from a
URI-encoded query string. Use the `UriQuery.toAny` instance method to convert
a `UriQuery` instance to a plain old JavaScript object containing key-value
query parameters.

```typescript
UriQuery.fromAny({a: "1", b: "2"});
// UriQuery.parse("a=1&b=2")

UriQuery.parse("a=alpha&b=beta").toAny();
// {a: "alpha", b: "beta"}
```

The `UriQuery.head` instance method returns a [key, value] tuple containing the
first parameter of the query. The `UriQuery.key` instance method returns the
key of the first parameter, if defined. And the `UriQuery.value` instance
method returns the value of the first parameter. The `UriPath.undefined`
static method returns the singleton undefined `UriQuery` instance, which serves
as the nil element of all `UriQuery` linked lists.

```typescript
UriQuery.parse("foo&bar=baz").head();
// [null, "foo"]

UriQuery.parse("foo&bar=baz").tail();
// UriQuery.parse("bar=baz")

UriQuery.parse("foo&bar=baz").tail().head();
// ["bar", "baz"]

UriQuery.parse("foo&bar=baz").tail().tail();
// UriQuery.undefined()
```

The `UriQuery.length` property returns the number of parameters in the query.
The `UriQuery.has` instance method returns `true` if the query has a parameter
with the given key. And the `UriQuery.get` instance method returns the value
associated with the given key, or `undefined` if no parameter with the given
key exists in the query.

```typescript
UriQuery.parse("foo&bar=baz").length;
// 2

UriQuery.parse("foo&bar=baz").has("bar");
// true

UriQuery.parse("foo&bar=baz").has("foo");
// false

UriQuery.parse("foo&bar=baz").get("bar");
// "baz"

UriQuery.parse("foo&bar=baz").get("foo");
// undefined
```

Use the `UriQuery.updated` instance method to update a query parameter,
inserting a new parameter if the key is not currently defined. Use the
`UriQuery.removed` instance method to remove a parameter from the query, if
defined. The `UriQuery.appended` and `UriQuery.prepended` instance methods
unconditionally append or prepend query parameters. A `null` key in a query
parameter indicates that the parameter is a literal string value, i.e. it
contains no `'='` sign in its encoded form.

```typescript
UriQuery.parse("b=1&c=2").updated("b", "beta");
// UriQuery.parse("b=beta&c=2")

UriQuery.parse("b=1&c=2").updated("c", "charlie");
// UriQuery.parse("b=1&c=charlie")

UriQuery.parse("b=1&c=2").updated("d", "delta");
// UriQuery.parse("b=1&c=2&d=delta")

UriQuery.parse("b=1&c=2").removed("b");
// UriQuery.parse("c=2")

UriQuery.parse("b=1&c=2").removed("b").removed("c");
// UriQuery.empty()

UriQuery.parse("b=1&c=2").appended("c", "charlie");
// UriQuery.parse("b=1&c=2&c=charlie")

UriQuery.parse("b=1&c=2").appended("delta");
// UriQuery.parse("b=1&c=2&delta")

UriQuery.parse("b=1&c=2").prepended("b", "beta");
// UriQuery.parse("b=beta&b=1&c=2")

UriQuery.parse("b=1&c=2").prepended("alpha");
// UriQuery.parse("alpha&b=1&c=2")
```

#### UriQueryBuilder

The `UriQueryBuilder` class provides an efficient way to incrementally
construct `UriQuery` objects by appending query parameters. `UriQueryBuilder`
implements the [Swim Util][util] `PairBuilder` interface, enabling query
parameters to be `push`ed onto the end of the query, like an array. Appends to
`UriQueryBuilder` instances take constant time.

The `UriQuery.builder` method returns a new `UriQueryBuilder` instance.

### UriFragment

The `UriFragment` class wraps a URI fragment identifier, giving it a meaningful
type, and a consistent set of methods. The `UriFragment.undefined` static
method returns the singleton undefined `UriFragment` instance. The
`UriFragment.create` static method returns a cached `UriFragment` instance with
the given fragment identifier. The `UriFragment.parse` static method decodes
an encoded URI fragment component.

The `UriFragment.isDefined` instance method returns `false` if the `UriFragment`
instance represents an undefined URI fragment component. The
`UriFragment.identifier` instance method returns the underlying fragment
identifier, or the `null` if the fragment is not defined.

```typescript
UriFragment.undefined().isDefined();
// false

UriFragment.create("toc").isDefined();
// true

UriFragment.create("2%");
// UriFragment.parse("2%25")

UriFragment.parse("https").identifier;
// "name"

UriFragment.parse("the%20end").identifier;
// "the end"

UriFragment.undefined().identifier;
// null
```

### UriCache

The `UriCache` class implements an efficient URI resolution cache, relative
to a fixed base URI, backed by a [Swim Util][util] `HashGenCacheMap`.
The `resolve` instance method resolves its URI argument relative to the cache's
base URI, returning a cached instance of the resolved URI when possible.
The `unresolve` instance method returns the relative components of its URI
argument, with respect to the cache's base URI, returning a cached instance
of the unresolved URI when possible.

[util]: https://github.com/swimos/swim/tree/main/swim-js/swim-runtime-js/swim-core-js/@swim/util
[codec]: https://github.com/swimos/swim/tree/main/swim-js/swim-runtime-js/swim-core-js/@swim/codec
