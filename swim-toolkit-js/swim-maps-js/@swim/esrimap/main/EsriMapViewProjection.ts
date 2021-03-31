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

import {AnyPointR2, PointR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {EsriProjection} from "./EsriProjection";

export class EsriMapViewProjection implements EsriProjection {
  constructor(map: __esri.MapView) {
    EsriProjection.init();
    Object.defineProperty(this, "map", {
      value: map,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly map: __esri.MapView;

  get bounds(): GeoBox {
    let extent = this.map.extent;
    if (extent !== null) {
      extent = EsriProjection.webMercatorUtils!.webMercatorToGeographic(extent) as __esri.Extent;
    }
    if (extent !== null) {
      return new GeoBox(extent.xmin, extent.ymin, extent.xmax, extent.ymax);
    } else {
      return GeoBox.globe();
    }
  }

  project(geoPoint: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
    let geoPoint: __esri.Point;
    if (typeof lng === "number") {
      geoPoint = {x: lng, y: lat!, spatialReference: {wkid: 4326}} as __esri.Point;
    } else if (Array.isArray(lng)) {
      geoPoint = {x: lng[0], y: lng[1], spatialReference: {wkid: 4326}} as __esri.Point;
    } else {
      geoPoint = {x: lng.lng, y: lng.lat, spatialReference: {wkid: 4326}} as __esri.Point;
    }
    const point = this.map.toScreen(geoPoint);
    return point !== null ? new PointR2(point.x, point.y) : PointR2.origin();
  }

  unproject(viewPoint: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyPointR2 | number, y?: number): GeoPoint {
    let viewPoint: __esri.ScreenPoint;
    if (typeof x === "number") {
      viewPoint = {x: x, y: y!};
    } else if (Array.isArray(x)) {
      viewPoint = {x: x[0], y: x[1]};
    } else {
      viewPoint = x;
    }
    const point = this.map.toMap(viewPoint);
    return point !== null ? new GeoPoint(point.longitude, point.latitude) : GeoPoint.origin();
  }
}
