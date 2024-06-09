// Copyright 2015-2024 Nstream, inc.
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
import type {R2PointLike} from "@swim/math";
import type {R2PointInit} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Box} from "@swim/math";
import type {GeoPointLike} from "@swim/geo";
import type {GeoPointInit} from "@swim/geo";
import {GeoPoint} from "@swim/geo";
import {GeoBox} from "@swim/geo";
import type {GeoViewport} from "./GeoViewport";

/** @public */
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

  abstract readonly viewFrame: R2Box;

  abstract withViewFrame(viewFrame: R2Box): WorldMapViewport;

  abstract project(geoPoint: GeoPointLike): R2Point;
  abstract project(lng: number, lat: number): R2Point;

  abstract unproject(viewPoint: R2PointLike): GeoPoint;
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

/** @public */
export class EquirectangularMapViewport extends WorldMapViewport {
  constructor(viewFrame: R2Box) {
    super();
    this.viewFrame = viewFrame;
  }

  override readonly viewFrame: R2Box;

  override withViewFrame(viewFrame: R2Box): WorldMapViewport {
    let xMin = viewFrame.xMin;
    let yMin = viewFrame.yMin;
    let xMax = viewFrame.xMax;
    let yMax = viewFrame.yMax;
    const width = xMax - xMin;
    const height = yMax - yMin;
    const frameRatio = width / height;
    const mapRatio = 2;
    if (frameRatio < mapRatio) { // shrink y
      const dy = (height - width / mapRatio) / 2;
      yMin += dy;
      yMax -= dy;
      viewFrame = new R2Box(xMin, yMin, xMax, yMax);
    } else if (frameRatio > mapRatio) { // shrink x
      const dx = (width - height * mapRatio) / 2;
      xMin += dx;
      xMax -= dx;
      viewFrame = new R2Box(xMin, yMin, xMax, yMax);
    }
    return new EquirectangularMapViewport(viewFrame);
  }

  override project(geoPoint: GeoPointLike): R2Point;
  override project(lng: number, lat: number): R2Point;
  override project(lng: GeoPointLike | number, lat?: number): R2Point {
    if (arguments.length === 1) {
      if (Array.isArray(lng)) {
        lat = lng[1];
        lng = lng[0];
      } else {
        lat = (lng as GeoPointInit | GeoPoint).lat;
        lng = (lng as GeoPointInit | GeoPoint).lng;
      }
    }
    const viewFrame = this.viewFrame;
    const x = viewFrame.xMin + ((180 + (lng as number)) / 360) * viewFrame.width;
    const y = viewFrame.yMax - ((90 + (lat as number)) / 180) * viewFrame.height;
    return new R2Point(x, y);
  }

  override unproject(viewPoint: R2PointLike): GeoPoint;
  override unproject(x: number, y: number): GeoPoint;
  override unproject(x: R2PointLike | number, y?: number): GeoPoint {
    if (arguments.length === 1) {
      if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
      } else {
        y = (x as R2PointInit | R2Point).y;
        x = (x as R2PointInit | R2Point).x;
      }
    }
    const viewFrame = this.viewFrame;
    const lng = 360 * ((x as number) - viewFrame.xMin) / viewFrame.width - 180;
    const lat = 180 * (viewFrame.yMax - (y as number)) / viewFrame.height - 90;
    return new GeoPoint(lng, lat);
  }
}
