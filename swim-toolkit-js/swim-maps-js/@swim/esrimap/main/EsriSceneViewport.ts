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

/// <reference types="arcgis-js-api"/>

import {AnyPointR2, PointR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {EsriViewport} from "./EsriViewport";

export class EsriSceneViewport extends EsriViewport {
  constructor(map: __esri.SceneView, geoFrame: GeoBox, geoCenter: GeoPoint,
              zoom: number, heading: number, tilt: number) {
    super(map, geoFrame, geoCenter, zoom, heading, tilt);
  }

  declare readonly map: __esri.SceneView;

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

  static create(map: __esri.SceneView): EsriSceneViewport {
    let mapFrame = map.extent;
    let geoFrame: GeoBox;
    if (mapFrame !== null) {
      mapFrame = EsriViewport.webMercatorUtils!.webMercatorToGeographic(mapFrame) as __esri.Extent;
      geoFrame = new GeoBox(mapFrame.xmin, mapFrame.ymin, mapFrame.xmax, mapFrame.ymax);
    } else {
      geoFrame = GeoBox.undefined();
    }
    const mapCenter = map.center;
    const geoCenter = new GeoPoint(mapCenter.longitude, mapCenter.latitude);
    const zoom = map.zoom;
    const heading = map.camera.heading;
    const tilt = map.camera.tilt;
    return new EsriSceneViewport(map, geoFrame, geoCenter, zoom, heading, tilt);
  }
}