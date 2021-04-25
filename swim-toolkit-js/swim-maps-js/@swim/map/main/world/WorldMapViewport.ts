// Copyright 2015-2020 Swim inc.
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

import type {Equals} from "@swim/util";
import type {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import type {GeoViewport} from "../geo/GeoViewport";

export abstract class WorldMapViewport implements GeoViewport, Equals {
  get geoFrame(): GeoBox {
    return GeoBox.globe();
  }

  get geoCenter(): GeoPoint {
    return GeoPoint.origin();
  }

  get zoom(): number {
    return 0;
  }

  get heading(): number {
    return 0;
  }

  get tilt(): number {
    return 0;
  }

  abstract readonly viewFrame: BoxR2;

  abstract withViewFrame(viewFrame: BoxR2): WorldMapViewport;

  abstract project(geoPoint: AnyGeoPoint): PointR2;
  abstract project(lng: number, lat: number): PointR2;

  abstract unproject(viewPoint: AnyPointR2): GeoPoint;
  abstract unproject(x: number, y: number): GeoPoint;

  protected canEqual(that: unknown): boolean {
    return that instanceof WorldMapViewport
        && this.constructor === that.constructor;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof WorldMapViewport) {
      return that.canEqual(this)
          && this.viewFrame.equals(that.viewFrame);
    }
    return false;
  }
}