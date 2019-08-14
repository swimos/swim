# Swim UI Toolkit

[![package](https://img.shields.io/npm/v/@swim/ui.svg)](https://www.npmjs.com/package/@swim/ui)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_ui.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

The Swim UI toolkit implements a massively real-time user interface toolkit.
Procedural styling, and a unified view hierarchy, make it easy to consistently
animate—and efficiently render—mixed HTML, SVG, and Canvas components, enabling
uniform tweening of everything from HTML attributes, to CSS styles, SVG and
Canvas drawings, and custom parameters.  Swim UI is a part of the
[Swim System](https://www.npmjs.com/package/@swim/system) framework.

## Libraries

The Swim UI toolkit consists of the following component libraries:

- [**`@swim/ui`**](@swim/ui) –
  umbrella package that depends on, and re-exports, all Swim UI libraries.
- [**`@swim/angle`**](@swim/angle) –
  dimensional angle types with unit-aware algebraic operators, conversions,
  and parsers.
- [**`@swim/length`**](@swim/length) –
  DOM-relative length types with unit-aware algebraic operators, conversions,
  and parsers.
- [**`@swim/color`**](@swim/color) –
  RGB and HSL color types with color-space-aware operators, conversions,
  and parsers.
- [**`@swim/font`**](@swim/font) –
  CSS font property types and parsers.
- [**`@swim/transform`**](@swim/transform) –
  CSS and SVG compatible transform types with unit-aware algebraic operators
  and parsers.
- [**`@swim/interpolate`**](@swim/interpolate) –
  interpolator types for blending between values, such as numbers, dates,
  angles, lengths, colors, transforms, shapes, arrays, structures, and
  other interpolators.
- [**`@swim/scale`**](@swim/scale) –
  scale types that map numeric and temporal input domains to interpolated
  output ranges, with support for continuous domain clamping, domain solving,
  range unscaling, and interpolation between scales.
- [**`@swim/transition`**](@swim/transition) –
  transition types that specify duration, ease, interpolator, and lifecycle
  callback parameters for tween animations.
- [**`@swim/animate`**](@swim/animate) –
  property-managing animator types that efficiently tween values between
  discrete state changes.
- [**`@swim/dom`**](@swim/dom) –
  CustomEvent and ResizeObserver polyfills.
- [**`@swim/style`**](@swim/style) –
  CSS style types and universal style value parser.
- [**`@swim/render`**](@swim/render) –
  renderable graphic types for SVG and Canvas compatible path drawing contexts,
  and Canvas compatible rendering contexts.
- [**`@swim/constraint`**](@swim/constraint) –
  incremental solver for systems of linear layout constraints.
- [**`@swim/view`**](@swim/view) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- [**`@swim/shape`**](@swim/shape) –
  canvas shape views, with animated geometry and style properties.
- [**`@swim/typeset`**](@swim/typeset) –
  canvas typesetting views, with animated text, layout, font, and style properties.
- [**`@swim/gesture`**](@swim/gesture) –
  multitouch gesture recognizers, with kinematic surface modeling.

Swim UI builds on the [Swim Core](https://www.npmjs.com/package/@swim/core)
framework; it has no additional dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/ui` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/ui/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/ui/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/ui` component libraries, can be found in
`node_modules/@swim/ui/dist/main/swim-ui.js`.

### Browser

Browser applications can load `swim-ui.js`, along with its `swim-core.js`
dependency, from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-ui.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles `@swim/ui` along with all other
[`@swim/system`](https://www.npmjs.com/package/@swim/system) frameworks.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/ui` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported,
in their entirety, from the top-level `@swim/ui` namespace.

```typescript
import * as swim from "@swim/ui";
```

### CommonJS

`@swim/ui` can also be used with CommonJS-compatible module systems.
All component libraries are re-exported, in their entirety, from the
top-level `@swim/ui` namespace.

```javascript
var swim = require("@swim/ui");
```

### Browser

When loaded by a web browser, the `swim-ui.js` script adds all component
library exports to the global `swim` namespace.  The `swim-ui.js` script
requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all `@swim/ui` component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` when additional `@swim/system` frameworks are needed.

## Development

**Note:**
`swim-ui-js` can be built against the currently checked out `swim-core-js`
sources by compiling it from the parent `swim-system-js` directory.

### Setup

Install build dependencies:

```sh
swim-ui-js $ npm install
```

### Build script

Use the `bin/build.js` script to build the Swim UI toolkit.  The build script
supports `compile`, `test`, `doc`, and `watch` commands, described below.
All build script commands take an optional `--projects` (`-p`) option to
restrict the build to a comma-separated list of projects.

Each project supports multiple output targets; typical targets for a project
include `main`, to build the main sources, and `test`, to build the test
sources.  A specific target can be built for a project by appending a colon
(`:`) and the target name to the project name.  For example, to build just the
`main` sources of the `util` project, pass `-p util:main` to the build script.

Most build commands take a `--devel` (`-d`) option to expedite development
builds by skipping the minification step.

Run `bin/build.js help` to see a complete list of build commands.  Run
`bin/build.js <command> --help` to see a list of options supported by a
particular build command.

### Compiling sources

Use the `compile` build script command to compile, bundle, and minify
TypeScript sources into JavaScript universal module definitions, output
to the `dist` subdirectory of each project.  To compile all targets,
of all projects, run:

```sh
swim-ui-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `color` project, and all
targets of the `transition` project, run:

```sh
swim-ui-js $ bin/build.js compile -p color:main,transition
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `style` project, run:

```sh
swim-ui-js $ bin/build.js test -p style
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `render` project when any source file in the project–or
in one of the project's transitive local dependencies–changes, run:

```sh
swim-ui-js $ bin/build.js watch -p render:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `font` project, bypassing minification, and skipping generation
of the main script, run:

```sh
swim-ui-js $ bin/build.js watch -p font:test -d -t
```
