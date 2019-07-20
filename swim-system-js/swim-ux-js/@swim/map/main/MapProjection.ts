// Copyright 2015-2019 SWIM.AI inc.
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

import {AnyPointR2, PointR2} from "@swim/math";
import {AnyLngLat, LngLat} from "./LngLat";

export interface MapProjection {
  readonly bounds: Readonly<[LngLat, LngLat]>;

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
}

/** @hidden */
export const MapProjection = {
  /** @hidden */
  _identity: void 0 as MapProjection | undefined,
  identity(): MapProjection {
    if (!MapProjection._identity) {
      MapProjection._identity = new IdentityMapProjection();
    }
    return MapProjection._identity;
  },

  is(object: unknown): object is MapProjection {
    if (typeof object === "object" && object) {
      const projection = object as MapProjection;
      return typeof projection.project === "function"
          && typeof projection.unproject === "function";
    }
    return false;
  },
};

/** @hidden */
export class IdentityMapProjection implements MapProjection {
  get bounds(): Readonly<[LngLat, LngLat]> {
    return [LngLat.origin(), LngLat.origin()];
  }

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    let x: number;
    let y: number;
    if (typeof lng === "number") {
      x = lng;
      y = lat!;
    } else {
      const coord = LngLat.fromAny(lng);
      x = coord.lng;
      y = coord.lat;
    }
    return new PointR2(x, y);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    let lng: number;
    let lat: number;
    if (typeof x === "number") {
      lng = x;
      lat = y!;
    } else {
      const point = PointR2.fromAny(x);
      lng = point.x;
      lat = point.y;
    }
    return new LngLat(lng, lat);
  }
}
