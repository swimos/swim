// Copyright 2015-2023 Nstream, inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type {GeoShape} from "./GeoShape";
import {GeoPoint} from "./GeoPoint";
import type {GeoCurve} from "./GeoCurve";
import {GeoSegment} from "./GeoSegment";
import {GeoSpline} from "./GeoSpline";
import {GeoPath} from "./GeoPath";
import {GeoGroup} from "./GeoGroup";

/** @public */
export type GeoJsonPosition = [number, number] | [number, number, number];

/** @public */
export const GeoJsonPosition = {
  [Symbol.hasInstance](instance: unknown): instance is GeoJsonPosition {
    return Array.isArray(instance)
        && ((instance.length === 2 && typeof instance[0] === "number" && typeof instance[1] === "number")
         || (instance.length === 3 && typeof instance[0] === "number" && typeof instance[1] === "number" && typeof instance[2] === "number"));
  },
};

/** @public */
export type GeoJsonBbox = [number, number, number, number]
                        | [number, number, number, number, number, number];

/** @public */
export type GeoJsonType = GeoJsonGeometryType
                        | "Feature"
                        | "FeatureCollection";

/** @public */
export interface GeoJsonObject {
  type: GeoJsonType;
  bbox?: GeoJsonBbox;
}

/** @public */
export type GeoJson = GeoJsonGeometry
                    | GeoJsonFeature
                    | GeoJsonFeatureCollection;

/** @public */
export const GeoJson = {
  toShape: function (object: GeoJson): GeoShape | (GeoShape | null)[] | null {
    if (object.type === "Feature") {
      return GeoJsonFeature.toShape(object);
    } else if (object.type === "FeatureCollection") {
      return GeoJsonFeatureCollection.toShapes(object);
    }
    return GeoJsonGeometry.toShape(object);
  } as {
    (geometry: GeoJsonGeometry): GeoShape;
    (feature: GeoJsonFeature): GeoShape | null;
    (collection: GeoJsonFeatureCollection): (GeoShape | null)[] | null;
    (object: GeoJson): GeoShape | (GeoShape | null)[] | null;
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJson {
    return GeoJsonGeometry[Symbol.hasInstance](instance)
        || GeoJsonFeature[Symbol.hasInstance](instance)
        || GeoJsonFeatureCollection[Symbol.hasInstance](instance);
  },
};

/** @public */
export type GeoJsonGeometryType = "Point"
                                | "MultiPoint"
                                | "LineString"
                                | "MultiLineString"
                                | "Polygon"
                                | "MultiPolygon"
                                | "GeometryCollection";

/** @public */
export interface GeoJsonGeometryObject extends GeoJsonObject {
  type: GeoJsonGeometryType;
}

/** @public */
export type GeoJsonGeometry = GeoJsonPoint
                            | GeoJsonMultiPoint
                            | GeoJsonLineString
                            | GeoJsonMultiLineString
                            | GeoJsonPolygon
                            | GeoJsonMultiPolygon
                            | GeoJsonGeometryCollection;

/** @public */
export const GeoJsonGeometry = {
  toShape(object: GeoJsonGeometry): GeoShape {
    if (object.type === "Point") {
      return GeoJsonPoint.toShape(object);
    } else if (object.type === "MultiPoint") {
      return GeoJsonMultiPoint.toShape(object);
    } else if (object.type === "LineString") {
      return GeoJsonLineString.toShape(object);
    } else if (object.type === "MultiLineString") {
      return GeoJsonMultiLineString.toShape(object);
    } else if (object.type === "Polygon") {
      return GeoJsonPolygon.toShape(object);
    } else if (object.type === "MultiPolygon") {
      return GeoJsonMultiPolygon.toShape(object);
    } else if (object.type === "GeometryCollection") {
      return GeoJsonGeometryCollection.toShape(object);
    }
    throw new TypeError("" + object);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonGeometry {
    return GeoJsonPoint[Symbol.hasInstance](instance)
        || GeoJsonMultiPoint[Symbol.hasInstance](instance)
        || GeoJsonLineString[Symbol.hasInstance](instance)
        || GeoJsonMultiLineString[Symbol.hasInstance](instance)
        || GeoJsonPolygon[Symbol.hasInstance](instance)
        || GeoJsonMultiPolygon[Symbol.hasInstance](instance)
        || GeoJsonGeometryCollection[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface GeoJsonPoint extends GeoJsonGeometryObject {
  readonly type: "Point";
  coordinates: GeoJsonPosition;
}

/** @public */
export const GeoJsonPoint = {
  toShape(object: GeoJsonPoint): GeoPoint {
    const position = object.coordinates;
    return new GeoPoint(position[0], position[1]);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonPoint {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonPoint).type === "Point"
        && GeoJsonPosition[Symbol.hasInstance]((instance as GeoJsonPoint).coordinates);
  },
};

/** @public */
export interface GeoJsonMultiPoint extends GeoJsonGeometryObject {
  readonly type: "MultiPoint";
  coordinates: GeoJsonPosition[];
}

/** @public */
export const GeoJsonMultiPoint = {
  toShape(object: GeoJsonMultiPoint): GeoGroup<GeoPoint> {
    const positions = object.coordinates;
    const n = positions.length;
    const shapes = new Array<GeoPoint>(n);
    for (let i = 0; i < n; i += 1) {
      const position = positions[i]!;
      shapes[i] = new GeoPoint(position[0], position[1]);
    }
    return new GeoGroup(shapes);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonMultiPoint {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonMultiPoint).type === "MultiPoint"
        && Array.isArray((instance as GeoJsonMultiPoint).coordinates);
  },
};

/** @public */
export interface GeoJsonLineString extends GeoJsonGeometryObject {
  readonly type: "LineString";
  coordinates: GeoJsonPosition[];
}

/** @public */
export const GeoJsonLineString = {
  toShape(object: GeoJsonLineString): GeoSpline {
    const lineString = object.coordinates;
    const n = lineString.length;
    if (n === 0) {
      return GeoSpline.empty();
    }
    const curves = new Array<GeoCurve>(n - 1);
    let position = lineString[0]!;
    let lng = position[0];
    let lat = position[1];
    for (let i = 1; i < n; i += 1) {
      position = lineString[i]!;
      curves[i - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
    }
    return new GeoSpline(curves, false);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonLineString {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonLineString).type === "LineString"
        && Array.isArray((instance as GeoJsonLineString).coordinates);
  },
};

/** @public */
export interface GeoJsonMultiLineString extends GeoJsonGeometryObject {
  readonly type: "MultiLineString";
  coordinates: GeoJsonPosition[][];
}

/** @public */
export const GeoJsonMultiLineString = {
  toShape(object: GeoJsonMultiLineString): GeoGroup<GeoSpline> {
    const multiLineString = object.coordinates;
    const n = multiLineString.length;
    const shapes = new Array<GeoSpline>(n);
    for (let i = 0; i < n; i += 1) {
      const lineString = multiLineString[i]!;
      const m = lineString.length;
      if (m === 0) {
        shapes[i] = GeoSpline.empty();
        continue;
      }
      const curves = new Array<GeoCurve>(m - 1);
      let position = lineString[0]!;
      let lng = position[0];
      let lat = position[1];
      for (let j = 1; j < m; j += 1) {
        position = lineString[j]!;
        curves[j - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
      }
      shapes[i] = new GeoSpline(curves, false);
    }
    return new GeoGroup(shapes);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonMultiLineString {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonMultiLineString).type === "MultiLineString"
        && Array.isArray((instance as GeoJsonMultiLineString).coordinates);
  },
};

/** @public */
export interface GeoJsonPolygon extends GeoJsonGeometryObject {
  readonly type: "Polygon";
  coordinates: GeoJsonPosition[][];
}

/** @public */
export const GeoJsonPolygon = {
  toShape(object: GeoJsonPolygon): GeoPath {
    const polygons = object.coordinates;
    const n = polygons.length;
    const splines = new Array<GeoSpline>(n);
    for (let i = 0; i < n; i += 1) {
      const polygon = polygons[i]!;
      const m = polygon.length;
      if (m === 0) {
        splines[i] = GeoSpline.empty();
        continue;
      }
      const curves = new Array<GeoCurve>(m - 1);
      let position = polygon[0]!;
      let lng = position[0];
      let lat = position[1];
      for (let j = 1; j < m; j += 1) {
        position = polygon[j]!;
        curves[j - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
      }
      splines[i] = new GeoSpline(curves, true);
    }
    return new GeoPath(splines);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonPolygon {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonPolygon).type === "Polygon"
        && Array.isArray((instance as GeoJsonPolygon).coordinates);
  },
};

/** @public */
export interface GeoJsonMultiPolygon extends GeoJsonGeometryObject {
  readonly type: "MultiPolygon";
  coordinates: GeoJsonPosition[][][];
}

/** @public */
export const GeoJsonMultiPolygon = {
  toShape(object: GeoJsonMultiPolygon): GeoGroup<GeoPath> {
    const multiPolygon = object.coordinates;
    const n = multiPolygon.length;
    const shapes = new Array<GeoPath>(n);
    for (let i = 0; i < n; i += 1) {
      const polygons = multiPolygon[i]!;
      const m = polygons.length;
      const splines = new Array<GeoSpline>(m);
      for (let j = 0; j < m; j += 1) {
        const polygon = polygons[j]!;
        const o = polygon.length;
        if (o === 0) {
          splines[j] = GeoSpline.empty();
          continue;
        }
        const curves = new Array<GeoCurve>(o - 1);
        let position = polygon[0]!;
        let lng = position[0];
        let lat = position[1];
        for (let k = 1; k < o; k += 1) {
          position = polygon[k]!;
          curves[k - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
        }
        splines[j] = new GeoSpline(curves, true);
      }
      shapes[i] = new GeoPath(splines);
    }
    return new GeoGroup(shapes);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonMultiPolygon {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonMultiPolygon).type === "MultiPolygon"
        && Array.isArray((instance as GeoJsonMultiPolygon).coordinates);
  },
};

/** @public */
export interface GeoJsonGeometryCollection extends GeoJsonGeometryObject {
  readonly type: "GeometryCollection";
  geometries: GeoJsonGeometry[];
}

/** @public */
export const GeoJsonGeometryCollection = {
  toShape(object: GeoJsonGeometryCollection): GeoGroup {
    const geometries = object.geometries;
    const n = geometries.length;
    const shapes = new Array<GeoShape>(n);
    for (let i = 0; i < n; i += 1) {
      shapes[i] = GeoJsonGeometry.toShape(geometries[i]!);
    }
    return new GeoGroup(shapes);
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonGeometryCollection {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonGeometryCollection).type === "GeometryCollection"
        && Array.isArray((instance as GeoJsonGeometryCollection).geometries);
  },
};

/** @public */
export type GeoJsonProperties = {[name: string]: unknown};

/** @public */
export interface GeoJsonFeature<G extends GeoJsonGeometry = GeoJsonGeometry, P = GeoJsonProperties> extends GeoJsonObject {
  type: "Feature";
  geometry: G | null;
  properties: P | null;
  id?: string | number;
}

/** @public */
export const GeoJsonFeature = {
  toShape(feature: GeoJsonFeature): GeoShape | null {
    const geometry = feature.geometry;
    return geometry !== null ? GeoJsonGeometry.toShape(geometry) : null;
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonFeature {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonFeature).type === "Feature"
        && GeoJsonGeometry[Symbol.hasInstance]((instance as GeoJsonFeature).geometry)
        && typeof (instance as GeoJsonFeature).properties === "object";
  },
};

/** @public */
export interface GeoJsonFeatureCollection<G extends GeoJsonGeometry = GeoJsonGeometry, P = GeoJsonProperties> extends GeoJsonObject {
  type: "FeatureCollection";
  features: GeoJsonFeature<G, P>[];
}

/** @public */
export const GeoJsonFeatureCollection = {
  toShapes(object: GeoJsonFeatureCollection): (GeoShape | null)[] {
    const features = object.features;
    const n = features.length;
    const shapes = new Array<GeoShape | null>(n);
    for (let i = 0; i < n; i += 1) {
      shapes[i] = GeoJsonFeature.toShape(features[i]!);
    }
    return shapes;
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoJsonFeatureCollection {
    return instance !== null && typeof instance === "object"
        && (instance as GeoJsonFeatureCollection).type === "FeatureCollection"
        && Array.isArray((instance as GeoJsonFeatureCollection).features);
  },
};
