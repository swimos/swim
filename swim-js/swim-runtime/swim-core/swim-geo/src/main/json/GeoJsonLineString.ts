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
import type {GeoJsonPosition} from "./GeoJsonPosition";
import type {GeoJsonGeometryObject} from "./GeoJsonGeometry";

/** @public */
export interface GeoJsonLineString extends GeoJsonGeometryObject {
  readonly type: "LineString";
  coordinates: GeoJsonPosition[];
}

/** @public */
export const GeoJsonLineString = (function () {
  const GeoJsonLineString = {} as {
    is(value: unknown): value is GeoJsonLineString;
    toShape(object: GeoJsonLineString): GeoSpline;
  };

  GeoJsonLineString.is = function (value: unknown): value is GeoJsonLineString {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonLineString;
      return object.type === "LineString"
          && Array.isArray(object.coordinates);
    }
    return false;
  };

  GeoJsonLineString.toShape = function (object: GeoJsonLineString): GeoSpline {
    const lineString = object.coordinates;
    const n = lineString.length;
    if (n > 0) {
      const curves = new Array<GeoCurve>(n - 1);
      let position = lineString[0]!;
      let lng = position[0];
      let lat = position[1];
      for (let i = 1; i < n; i += 1) {
        position = lineString[i]!;
        curves[i - 1] = new GeoSegment(lng, lat, (lng = position[0], lng), (lat = position[1], lat));
      }
      return new GeoSpline(curves, false);
    } else {
      return GeoSpline.empty();
    }
  };

  return GeoJsonLineString;
})();
