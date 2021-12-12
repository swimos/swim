// Copyright 2015-2021 Swim.inc
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

import type {GeoShape} from "../GeoShape";
import type {GeoJsonObject} from "./GeoJson";
import {GeoJsonPoint} from "./"; // forward import
import {GeoJsonMultiPoint} from "./"; // forward import
import {GeoJsonLineString} from "./"; // forward import
import {GeoJsonMultiLineString} from "./"; // forward import
import {GeoJsonPolygon} from "./"; // forward import
import {GeoJsonMultiPolygon} from "./"; // forward import
import {GeoJsonGeometryCollection} from "./"; // forward import

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
export const GeoJsonGeometry = (function () {
  const GeoJsonGeometry = {} as {
    is(value: unknown): value is GeoJsonGeometry;
    toShape(object: GeoJsonGeometry): GeoShape;
  };

  GeoJsonGeometry.is = function (value: unknown): value is GeoJsonGeometry {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonGeometry;
      return (object.type === "Point"
           || object.type === "MultiPoint"
           || object.type === "LineString"
           || object.type === "MultiLineString"
           || object.type === "Polygon"
           || object.type === "MultiPolygon")
          && Array.isArray(object.coordinates)
          || object.type === "GeometryCollection"
          && Array.isArray(object.geometries);
    }
    return false;
  };

  GeoJsonGeometry.toShape = function (object: GeoJsonGeometry): GeoShape {
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
    } else {
      throw new TypeError("" + object);
    }
  };

  return GeoJsonGeometry;
})();
