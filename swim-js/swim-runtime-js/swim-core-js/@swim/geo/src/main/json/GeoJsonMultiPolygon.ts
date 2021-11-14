// Copyright 2015-2021 Swim Inc.
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

import type {GeoCurve} from "../GeoCurve";
import {GeoSegment} from "../GeoSegment";
import {GeoSpline} from "../GeoSpline";
import {GeoPath} from "../GeoPath";
import {GeoGroup} from "../GeoGroup";
import type {GeoJsonPosition} from "./GeoJsonPosition";
import type {GeoJsonGeometryObject} from "./GeoJsonGeometry";

/** @public */
export interface GeoJsonMultiPolygon extends GeoJsonGeometryObject {
  readonly type: "MultiPolygon";
  coordinates: GeoJsonPosition[][][];
}

/** @public */
export const GeoJsonMultiPolygon = (function () {
  const GeoJsonMultiPolygon = {} as {
    is(value: unknown): value is GeoJsonMultiPolygon;
    toShape(object: GeoJsonMultiPolygon): GeoGroup<GeoPath>;
  };

  GeoJsonMultiPolygon.is = function (value: unknown): value is GeoJsonMultiPolygon {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonMultiPolygon;
      return object.type === "MultiPolygon"
          && Array.isArray(object.coordinates);
    }
    return false;
  };

  GeoJsonMultiPolygon.toShape = function (object: GeoJsonMultiPolygon): GeoGroup<GeoPath> {
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
        if (o > 0) {
          const curves = new Array<GeoCurve>(o - 1);
          let position = polygon[0]!;
          let lng = position[0];
          let lat = position[1];
          for (let k = 1; k < o; k += 1) {
            position = polygon[k]!;
            curves[k - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
          }
          splines[j] = new GeoSpline(curves, true);
        } else {
          splines[j] = GeoSpline.empty();
        }
      }
      shapes[i] = new GeoPath(splines);
    }
    return new GeoGroup(shapes);
  };

  return GeoJsonMultiPolygon;
})();
