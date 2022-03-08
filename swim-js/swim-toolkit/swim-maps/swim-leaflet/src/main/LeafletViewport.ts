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

import type {Equals} from "@swim/util";
import {AnyR2Point, R2Point, Transform, TranslateTransform} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import type {GeoViewport} from "@swim/map";

/** @public */
export class LeafletViewport implements GeoViewport, Equals {
  constructor(map: L.Map, geoFrame: GeoBox, geoCenter: GeoPoint, viewOrigin: R2Point,
              zoom: number, heading: number, tilt: number) {
    this.map = map;
    this.geoFrame = geoFrame;
    this.geoCenter = geoCenter;
    this.viewOrigin = viewOrigin;
    this.zoom = zoom;
    this.heading = heading;
    this.tilt = tilt;
  }

  readonly map: L.Map;

  readonly geoFrame: GeoBox;

  readonly geoCenter: GeoPoint;

  readonly viewOrigin: R2Point;

  readonly zoom: number;

  readonly heading: number;

  readonly tilt: number;

  project(geoPoint: AnyGeoPoint): R2Point;
  project(lng: number, lat: number): R2Point;
  project(lng: AnyGeoPoint | number, lat?: number): R2Point {
    const origin = this.viewOrigin;
    let geoPoint: L.LatLngExpression;
    if (typeof lng === "number") {
      geoPoint = new L.LatLng(lat!, lng);
    } else if (Array.isArray(lng)) {
      geoPoint = new L.LatLng(lng[1], lng[0]);
    } else {
      geoPoint = lng;
    }
    const point = this.map.project(geoPoint, this.zoom);
    return new R2Point(point.x - origin.x, point.y - origin.y);
  }

  unproject(viewPoint: AnyR2Point): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyR2Point | number, y?: number): GeoPoint {
    const origin = this.viewOrigin;
    let viewPoint: L.PointExpression;
    if (typeof x === "number") {
      viewPoint = new L.Point(x + origin.x, y! + origin.y);
    } else if (Array.isArray(x)) {
      viewPoint = new L.Point(x[0] + origin.x, x[1] + origin.y);
    } else {
      viewPoint = new L.Point(x.x + origin.x, x.y + origin.y);
    }
    const point = this.map.unproject(viewPoint, this.zoom);
    return new GeoPoint(point.lng, point.lat);
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LeafletViewport) {
      return this.map === that.map
          && this.geoFrame.equals(that.geoFrame)
          && this.geoCenter.equals(that.geoCenter)
          && this.viewOrigin.equals(that.viewOrigin)
          && this.zoom === that.zoom
          && this.heading === that.heading
          && this.tilt === that.tilt;
    }
    return false;
  }

  static create(map: L.Map): LeafletViewport {
    const mapFrame = map.getBounds();
    const geoFrame = new GeoBox(mapFrame.getWest(), mapFrame.getSouth(),
                                mapFrame.getEast(), mapFrame.getNorth());
    const mapCenter = map.getCenter();
    const geoCenter = new GeoPoint(mapCenter.lng, mapCenter.lat);
    let {x, y} = map.getPixelOrigin();
    try {
      const mapTransform = Transform.parse(map.getPane("mapPane")!.style.transform);
      if (mapTransform instanceof TranslateTransform) {
        x -= mapTransform.x.pxValue();
        y -= mapTransform.y.pxValue();
      }
    } catch (e) {
      // swallow
    }
    const viewOrigin = new R2Point(x, y);
    const zoom = map.getZoom();
    const heading = 0;
    const tilt = 0;
    return new LeafletViewport(map, geoFrame, geoCenter, viewOrigin, zoom, heading, tilt);
  }
}
