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

import {AnyR2Point, R2PointInit, R2Point, R2Box} from "@swim/math";
import {AnyGeoPoint, GeoPointInit, GeoPoint} from "@swim/geo";
import {WorldMapViewport} from "./WorldMapViewport";

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

  override project(geoPoint: AnyGeoPoint): R2Point;
  override project(lng: number, lat: number): R2Point;
  override project(lng: AnyGeoPoint | number, lat?: number): R2Point {
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

  override unproject(viewPoint: AnyR2Point): GeoPoint;
  override unproject(x: number, y: number): GeoPoint;
  override unproject(x: AnyR2Point | number, y?: number): GeoPoint {
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
