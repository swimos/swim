// Copyright 2015-2021 Swim inc.
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

/// <reference types="arcgis-js-api"/>

import type {Equals} from "@swim/util";
import type {AnyR2Point, R2Point} from "@swim/math";
import type {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import type {GeoViewport} from "@swim/map";

export abstract class EsriViewport implements GeoViewport, Equals {
  constructor(map: __esri.View, geoFrame: GeoBox, geoCenter: GeoPoint,
              zoom: number, heading: number, tilt: number) {
    Object.defineProperty(this, "map", {
      value: map,
      enumerable: true,
    });
    Object.defineProperty(this, "geoFrame", {
      value: geoFrame,
      enumerable: true,
    });
    Object.defineProperty(this, "geoCenter", {
      value: geoCenter,
      enumerable: true,
    });
    Object.defineProperty(this, "zoom", {
      value: zoom,
      enumerable: true,
    });
    Object.defineProperty(this, "heading", {
      value: heading,
      enumerable: true,
    });
    Object.defineProperty(this, "tilt", {
      value: tilt,
      enumerable: true,
    });
  }

  readonly map!: __esri.View;

  readonly geoFrame!: GeoBox;

  readonly geoCenter!: GeoPoint;

  readonly zoom!: number;

  readonly heading!: number;

  readonly tilt!: number;

  abstract project(geoPoint: AnyGeoPoint): R2Point;
  abstract project(lng: number, lat: number): R2Point;

  abstract unproject(viewPoint: AnyR2Point): GeoPoint;
  abstract unproject(x: number, y: number): GeoPoint;

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof EsriViewport) {
      return this.map === that.map
          && this.geoFrame.equals(that.geoFrame)
          && this.geoCenter.equals(that.geoCenter)
          && this.zoom === that.zoom
          && this.heading === that.heading
          && this.tilt === that.tilt;
    }
    return false;
  }

  /** @hidden */
  static webMercatorUtils: __esri.webMercatorUtils | undefined = void 0;

  /** @hidden */
  static init(): void {
    if (EsriViewport.webMercatorUtils === void 0) {
      (window.require as any)(["esri/geometry/support/webMercatorUtils"], function (webMercatorUtils: __esri.webMercatorUtils): void {
        EsriViewport.webMercatorUtils = webMercatorUtils;
      });
    }
  }
}
