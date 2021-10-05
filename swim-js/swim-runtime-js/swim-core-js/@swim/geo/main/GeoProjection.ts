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

import type {AnyR2Point, R2Point} from "@swim/math";
import type {AnyGeoPoint, GeoPoint} from "./GeoPoint";

export interface GeoProjection {
  project(lnglat: AnyGeoPoint): R2Point;
  project(lng: number, lat: number): R2Point;

  unproject(point: AnyR2Point): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
}

/** @internal */
export const GeoProjection = (function () {
  const GeoProjection = {} as {
    is(object: unknown): object is GeoProjection;
  };

  GeoProjection.is = function (object: unknown): object is GeoProjection {
    if (object !== void 0 && object !== null) {
      const projection = object as GeoProjection;
      return typeof projection.project === "function"
          && typeof projection.unproject === "function";
    }
    return false;
  };

  return GeoProjection;
})();
