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

import type {GeoCurve} from "../GeoCurve";
import {GeoSegment} from "../GeoSegment";
import {GeoSpline} from "../GeoSpline";
import {GeoPath} from "../GeoPath";
import type {GeoJsonPosition} from "./GeoJsonPosition";
import type {GeoJsonGeometryObject} from "./GeoJsonGeometry";

/** @public */
export interface GeoJsonPolygon extends GeoJsonGeometryObject {
  readonly type: "Polygon";
  coordinates: GeoJsonPosition[][];
}

/** @public */
export const GeoJsonPolygon = (function () {
  const GeoJsonPolygon = {} as {
    is(value: unknown): value is GeoJsonPolygon;
    toShape(object: GeoJsonPolygon): GeoPath;
  };

  GeoJsonPolygon.is = function (value: unknown): value is GeoJsonPolygon {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonPolygon;
      return object.type === "Polygon"
          && Array.isArray(object.coordinates);
    }
    return false;
  };

  GeoJsonPolygon.toShape = function (object: GeoJsonPolygon): GeoPath {
    const polygons = object.coordinates;
    const n = polygons.length;
    const splines = new Array<GeoSpline>(n);
    for (let i = 0; i < n; i += 1) {
      const polygon = polygons[i]!;
      const m = polygon.length;
      if (m > 0) {
        const curves = new Array<GeoCurve>(m - 1);
        let position = polygon[0]!;
        let lng = position[0];
        let lat = position[1];
        for (let j = 1; j < m; j += 1) {
          position = polygon[j]!;
          curves[j - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
        }
        splines[i] = new GeoSpline(curves, true);
      } else {
        splines[i] = GeoSpline.empty();
      }
    }
    return new GeoPath(splines);
  };

  return GeoJsonPolygon;
})();
