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

import {GeoPoint} from "../GeoPoint";
import type {GeoJsonPosition} from "./GeoJsonPosition";
import type {GeoJsonGeometryObject} from "./GeoJsonGeometry";

/** @public */
export interface GeoJsonPoint extends GeoJsonGeometryObject {
  readonly type: "Point";
  coordinates: GeoJsonPosition;
}

/** @public */
export const GeoJsonPoint = (function () {
  const GeoJsonPoint = {} as {
    is(value: unknown): value is GeoJsonPoint;
    toShape(object: GeoJsonPoint): GeoPoint;
  };

  GeoJsonPoint.is = function (value: unknown): value is GeoJsonPoint {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonPoint;
      return object.type === "Point"
          && Array.isArray(object.coordinates);
    }
    return false;
  };

  GeoJsonPoint.toShape = function (object: GeoJsonPoint): GeoPoint {
    const position = object.coordinates;
    return new GeoPoint(position[0], position[1]);
  };

  return GeoJsonPoint;
})();
