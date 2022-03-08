// Copyright 2015-2022 Swim.inc
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
import {GeoGroup} from "../GeoGroup";
import type {GeoJsonPosition} from "./GeoJsonPosition";
import type {GeoJsonGeometryObject} from "./GeoJsonGeometry";

/** @public */
export interface GeoJsonMultiPoint extends GeoJsonGeometryObject {
  readonly type: "MultiPoint";
  coordinates: GeoJsonPosition[];
}

/** @public */
export const GeoJsonMultiPoint = (function () {
  const GeoJsonMultiPoint = {} as {
    is(value: unknown): value is GeoJsonMultiPoint;
    toShape(object: GeoJsonMultiPoint): GeoGroup<GeoPoint>;
  };

  GeoJsonMultiPoint.is = function (value: unknown): value is GeoJsonMultiPoint {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonMultiPoint;
      return object.type === "MultiPoint"
          && Array.isArray(object.coordinates);
    }
    return false;
  };

  GeoJsonMultiPoint.toShape = function (object: GeoJsonMultiPoint): GeoGroup<GeoPoint> {
    const positions = object.coordinates;
    const n = positions.length;
    const shapes = new Array<GeoPoint>(n);
    for (let i = 0; i < n; i += 1) {
      const position = positions[i]!;
      shapes[i] = new GeoPoint(position[0], position[1]);
    }
    return new GeoGroup(shapes);
  };

  return GeoJsonMultiPoint;
})();
