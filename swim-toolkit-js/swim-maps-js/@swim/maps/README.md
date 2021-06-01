# @swim/maps

[![package](https://img.shields.io/npm/v/@swim/maps.svg)](https://www.npmjs.com/package/@swim/maps)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_maps.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/maps** implements real-time geospatial map overlays, with support for
Mapbox, Google, and Esri maps.  These fully encapsulated widgets can be
embedded into any web application framework, or directly into any web page.
**@swim/maps** is a part of the broader
[**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit) framework.

## Framework

The **@swim/maps** umbrella package depends on, and re-exports, the following
component libraries:

- [**@swim/map**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/map)
  ([npm](https://www.npmjs.com/package/@swim/map),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_map.html)) –
  graphics views for efficiently rendering animated geospatial map overlays.
- [**@swim/mapbox**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/mapbox)
  ([npm](https://www.npmjs.com/package/@swim/mapbox),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mapbox.html)) –
  **@swim/map** overlays for Mapbox maps.
- [**@swim/leaflet**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/leaflet)
  ([npm](https://www.npmjs.com/package/@swim/leaflet),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_leaflet.html)) –
  **@swim/map** overlays for Leaflet maps.
- [**@swim/googlemap**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/googlemap)
  ([npm](https://www.npmjs.com/package/@swim/googlemap),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_googlemap.html)) –
  **@swim/map** overlays for Google maps.
- [**@swim/esrimap**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/esrimap)
  ([npm](https://www.npmjs.com/package/@swim/esrimap),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_esrimap.html)) –
  **@swim/map** overlays for ArcGIS maps.

**@swim/maps** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
and [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/ui)
frameworks; it has no additional required dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/maps` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/maps/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/maps/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/maps** component libraries, can be found in
`node_modules/@swim/maps/dist/main/swim-maps.js`.

### Browser

Browser applications can load `swim-maps.js`, along with its `swim-core.js`
and `swim-ui.js` dependencies, from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-maps.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-maps.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/maps** together with all other
[**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit)
frameworks.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-toolkit.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-toolkit.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/maps** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/maps` module.

```typescript
import * as swim from "@swim/maps";
```

### CommonJS

**@swim/maps** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/maps` module.

```javascript
var swim = require("@swim/maps");
```

### Browser

When loaded by a web browser, the `swim-maps.js` script adds all component
library exports to the global `swim` namespace.  The `swim-maps.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/maps** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` and `swim-maps.js` when additional **@swim/toolkit**
frameworks are needed.
