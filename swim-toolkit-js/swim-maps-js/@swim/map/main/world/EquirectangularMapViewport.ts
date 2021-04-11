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

import {AnyPointR2, PointR2Init, PointR2, BoxR2} from "@swim/math";
import {AnyGeoPoint, GeoPointInit, GeoPoint} from "@swim/geo";
import {WorldMapViewport} from "./WorldMapViewport";

export class EquirectangularMapViewport extends WorldMapViewport {
  constructor(viewFrame: BoxR2) {
    super();
    Object.defineProperty(this, "viewFrame", {
      value: viewFrame,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly viewFrame: BoxR2;

  withViewFrame(viewFrame: BoxR2): WorldMapViewport {
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
      viewFrame = new BoxR2(xMin, yMin, xMax, yMax);
    } else if (frameRatio > mapRatio) { // shrink x
      const dx = (width - height * mapRatio) / 2;
      xMin += dx;
      xMax -= dx;
      viewFrame = new BoxR2(xMin, yMin, xMax, yMax);
    }
    return new EquirectangularMapViewport(viewFrame);
  }

  project(geoPoint: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
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
    return new PointR2(x, y);
  }

  unproject(viewPoint: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyPointR2 | number, y?: number): GeoPoint {
    if (arguments.length === 1) {
      if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
      } else {
        y = (x as PointR2Init | PointR2).y;
        x = (x as PointR2Init | PointR2).x;
      }
    }
    const viewFrame = this.viewFrame;
    const lng = 360 * ((x as number) - viewFrame.xMin) / viewFrame.width - 180;
    const lat = 180 * (viewFrame.yMax - (y as number)) / viewFrame.height - 90;
    return new GeoPoint(lng, lat);
  }
}
