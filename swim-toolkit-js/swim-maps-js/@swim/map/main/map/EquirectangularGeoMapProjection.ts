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
import {AnyGeoPoint, GeoPointInit, GeoPoint, GeoBox} from "@swim/geo";
import {GeoMapProjection} from "./GeoMapProjection";

export class EquirectangularGeoMapProjection extends GeoMapProjection {
  constructor(frame: BoxR2) {
    super();
    Object.defineProperty(this, "frame", {
      value: frame,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly frame: BoxR2;

  withFrame(frame: BoxR2): GeoMapProjection {
    let xMin = frame.xMin;
    let yMin = frame.yMin;
    let xMax = frame.xMax;
    let yMax = frame.yMax;
    const width = xMax - xMin;
    const height = yMax - yMin;
    const frameRatio = width / height;
    const mapRatio = 2;
    if (frameRatio < mapRatio) { // shrink y
      const dy = (height - width / mapRatio) / 2;
      yMin += dy;
      yMax -= dy;
      frame = new BoxR2(xMin, yMin, xMax, yMax);
    } else if (frameRatio > mapRatio) { // shrink x
      const dx = (width - height * mapRatio) / 2;
      xMin += dx;
      xMax -= dx;
      frame = new BoxR2(xMin, yMin, xMax, yMax);
    }
    return new EquirectangularGeoMapProjection(frame);
  }

  get bounds(): GeoBox {
    return GeoBox.globe();
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
    const frame = this.frame;
    const x = frame.xMin + ((180 + (lng as number)) / 360) * frame.width;
    const y = frame.yMax - ((90 + (lat as number)) / 180) * frame.height;
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
    const frame = this.frame;
    const lng = 360 * ((x as number) - frame.xMin) / frame.width - 180;
    const lat = 180 * (frame.yMax - (y as number)) / frame.height - 90;
    return new GeoPoint(lng, lat);
  }
}
