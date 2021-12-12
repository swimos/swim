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
import {GeoGroup} from "../GeoGroup";
import type {GeoJsonPosition} from "./GeoJsonPosition";
import type {GeoJsonGeometryObject} from "./GeoJsonGeometry";

/** @public */
export interface GeoJsonMultiLineString extends GeoJsonGeometryObject {
  readonly type: "MultiLineString";
  coordinates: GeoJsonPosition[][];
}

/** @public */
export const GeoJsonMultiLineString = (function () {
  const GeoJsonMultiLineString = {} as {
    is(value: unknown): value is GeoJsonMultiLineString;
    toShape(object: GeoJsonMultiLineString): GeoGroup<GeoSpline>;
  };

  GeoJsonMultiLineString.is = function (value: unknown): value is GeoJsonMultiLineString {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonMultiLineString;
      return object.type === "MultiLineString"
          && Array.isArray(object.coordinates);
    }
    return false;
  };

  GeoJsonMultiLineString.toShape = function (object: GeoJsonMultiLineString): GeoGroup<GeoSpline> {
    const multiLineString = object.coordinates;
    const n = multiLineString.length;
    const shapes = new Array<GeoSpline>(n);
    for (let i = 0; i < n; i += 1) {
      const lineString = multiLineString[i]!;
      const m = lineString.length;
      if (m > 0) {
        const curves = new Array<GeoCurve>(m - 1);
        let position = lineString[0]!;
        let lng = position[0];
        let lat = position[1];
        for (let j = 1; j < m; j += 1) {
          position = lineString[j]!;
          curves[j - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
        }
        shapes[i] = new GeoSpline(curves, false);
      } else {
        shapes[i] = GeoSpline.empty();
      }
    }
    return new GeoGroup(shapes);
  };

  return GeoJsonMultiLineString;
})();
