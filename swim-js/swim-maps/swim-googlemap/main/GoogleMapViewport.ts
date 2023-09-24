// Copyright 2015-2023 Nstream, inc.
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
import {R2Point} from "@swim/math";
import type {GeoPointLike} from "@swim/geo";
import {GeoPoint} from "@swim/geo";
import {GeoBox} from "@swim/geo";
import type {GeoViewport} from "@swim/map";

/** @public */
export class GoogleMapViewport implements GeoViewport, Equals {
  constructor(projection: google.maps.MapCanvasProjection | null, geoFrame: GeoBox,
              geoCenter: GeoPoint, zoom: number, heading: number, tilt: number) {
    this.projection = projection;
    this.geoFrame = geoFrame;
    this.geoCenter = geoCenter;
    this.zoom = zoom;
    this.heading = heading;
    this.tilt = tilt;
  }

  readonly projection: google.maps.MapCanvasProjection | null;

  readonly geoFrame: GeoBox;

  readonly geoCenter: GeoPoint;

  readonly zoom: number;

  readonly heading: number;

  readonly tilt: number;

  project(geoPoint: GeoPointLike): R2Point;
  project(lng: number, lat: number): R2Point;
  project(lng: GeoPointLike | number, lat?: number): R2Point {
    const projection = this.projection;
    if (projection === null) {
      return R2Point.undefined();
    }
    let geoPoint: google.maps.LatLng;
    if (typeof lng === "number") {
      geoPoint = new google.maps.LatLng(lat!, lng);
    } else if (Array.isArray(lng)) {
      geoPoint = new google.maps.LatLng(lng[1], lng[0]);
    } else {
      geoPoint = new google.maps.LatLng(lng.lat, lng.lng);
    }
    const point = projection.fromLatLngToContainerPixel(geoPoint);
    if (point === null) {
      return R2Point.undefined();
    }
    return new R2Point(point.x, point.y);
  }

  unproject(viewPoint: R2PointLike): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: R2PointLike | number, y?: number): GeoPoint {
    const projection = this.projection;
    if (projection === null) {
      return GeoPoint.undefined();
    }
    let viewPoint: google.maps.Point;
    if (typeof x === "number") {
      viewPoint = new google.maps.Point(x, y!);
    } else if (Array.isArray(x)) {
      viewPoint = new google.maps.Point(x[0], x[1]);
    } else {
      viewPoint = new google.maps.Point(x.x, x.y);
    }
    const point = projection.fromContainerPixelToLatLng(viewPoint);
    if (point === null) {
      return GeoPoint.undefined();
    }
    return new GeoPoint(point.lng(), point.lat());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GoogleMapViewport) {
      return this.projection === that.projection
          && this.geoFrame.equals(that.geoFrame)
          && this.geoCenter.equals(that.geoCenter)
          && this.zoom === that.zoom
          && this.heading === that.heading
          && this.tilt === that.tilt;
    }
    return false;
  }

  static create(map: google.maps.Map, projection: google.maps.MapCanvasProjection | null | undefined): GoogleMapViewport {
    if (projection === void 0) {
      projection = null;
    }
    const mapFrame = map.getBounds();
    let geoFrame: GeoBox;
    if (mapFrame !== void 0 && mapFrame !== null) {
      const sw = mapFrame.getSouthWest();
      const ne = mapFrame.getNorthEast();
      geoFrame = new GeoBox(sw.lng(), sw.lat(), ne.lng(), ne.lat());
    } else {
      geoFrame = GeoBox.undefined();
    }
    const mapCenter = map.getCenter();
    const geoCenter = mapCenter !== void 0 ? new GeoPoint(mapCenter.lng(), mapCenter.lat()) : GeoPoint.origin();
    let zoom = map.getZoom();
    if (zoom === void 0) {
      zoom = 0;
    }
    let heading = map.getHeading();
    if (heading === void 0) {
      heading = 0;
    }
    let tilt = map.getTilt();
    if (tilt === void 0) {
      tilt = 0;
    }
    return new GoogleMapViewport(projection, geoFrame, geoCenter, zoom, heading, tilt);
  }
}
