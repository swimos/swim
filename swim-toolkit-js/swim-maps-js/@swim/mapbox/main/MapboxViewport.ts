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

import type {Equals} from "@swim/util";
import {AnyPointR2, PointR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import type {GeoViewport} from "@swim/map";

export class MapboxViewport implements GeoViewport, Equals {
  constructor(map: mapboxgl.Map, geoFrame: GeoBox, geoCenter: GeoPoint,
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

  declare readonly map: mapboxgl.Map;

  declare readonly geoFrame: GeoBox;

  declare readonly geoCenter: GeoPoint;

  declare readonly zoom: number;

  declare readonly heading: number;

  declare readonly tilt: number;

  project(geoPoint: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
    let geoPoint: mapboxgl.LngLatLike;
    if (typeof lng === "number") {
      geoPoint = new mapboxgl.LngLat(lng, lat!);
    } else {
      geoPoint = lng;
    }
    const point = this.map.project(geoPoint);
    return new PointR2(point.x, point.y);
  }

  unproject(viewPoint: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyPointR2 | number, y?: number): GeoPoint {
    let viewPoint: mapboxgl.PointLike;
    if (typeof x === "number") {
      viewPoint = new mapboxgl.Point(x, y!);
    } else if (Array.isArray(x)) {
      viewPoint = x;
    } else {
      viewPoint = new mapboxgl.Point(x.x, x.y);
    }
    const point = this.map.unproject(viewPoint);
    return new GeoPoint(point.lng, point.lat);
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof MapboxViewport) {
      return this.map === that.map
          && this.geoFrame.equals(that.geoFrame)
          && this.geoCenter.equals(that.geoCenter)
          && this.zoom === that.zoom
          && this.heading === that.heading
          && this.tilt === that.tilt;
    }
    return false;
  }

  static create(map: mapboxgl.Map): MapboxViewport {
    const mapFrame = map.getBounds();
    const geoFrame = new GeoBox(mapFrame.getWest(), mapFrame.getSouth(),
                                mapFrame.getEast(), mapFrame.getNorth());
    const mapCenter = map.getCenter();
    const geoCenter = new GeoPoint(mapCenter.lng, mapCenter.lat);
    const zoom = map.getZoom();
    const heading = map.getBearing();
    const tilt = map.getPitch();
    return new MapboxViewport(map, geoFrame, geoCenter, zoom, heading, tilt);
  }
}
