// Copyright 2015-2023 Swim.inc
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

import {AnyR2Point, R2Point} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {EsriViewport} from "./EsriViewport";

/** @public */
export class EsriMapViewport extends EsriViewport {
  constructor(map: __esri.MapView, geoFrame: GeoBox, geoCenter: GeoPoint,
              zoom: number, heading: number, tilt: number) {
    super(map, geoFrame, geoCenter, zoom, heading, tilt);
  }

  override readonly map!: __esri.MapView;

  override project(geoPoint: AnyGeoPoint): R2Point;
  override project(lng: number, lat: number): R2Point;
  override project(lng: AnyGeoPoint | number, lat?: number): R2Point {
    let geoPoint: __esri.Point;
    if (typeof lng === "number") {
      geoPoint = {x: lng, y: lat!, spatialReference: {wkid: 4326}} as __esri.Point;
    } else if (Array.isArray(lng)) {
      geoPoint = {x: lng[0], y: lng[1], spatialReference: {wkid: 4326}} as __esri.Point;
    } else {
      geoPoint = {x: lng.lng, y: lng.lat, spatialReference: {wkid: 4326}} as __esri.Point;
    }
    const point = this.map.toScreen(geoPoint);
    return point !== null ? new R2Point(point.x, point.y) : R2Point.origin();
  }

  override unproject(viewPoint: AnyR2Point): GeoPoint;
  override unproject(x: number, y: number): GeoPoint;
  override unproject(x: AnyR2Point | number, y?: number): GeoPoint {
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

  static create(map: __esri.MapView): EsriMapViewport {
    let mapFrame = map.extent;
    let geoFrame: GeoBox;
    if (mapFrame !== null) {
      mapFrame = EsriViewport.webMercatorUtils!.webMercatorToGeographic(mapFrame, false) as __esri.Extent;
      geoFrame = new GeoBox(mapFrame.xmin, mapFrame.ymin, mapFrame.xmax, mapFrame.ymax);
    } else {
      geoFrame = GeoBox.undefined();
    }
    const mapCenter = map.center;
    const geoCenter = new GeoPoint(mapCenter.longitude, mapCenter.latitude);
    const zoom = map.zoom;
    const heading = map.rotation;
    const tilt = 0;
    return new EsriMapViewport(map, geoFrame, geoCenter, zoom, heading, tilt);
  }
}
