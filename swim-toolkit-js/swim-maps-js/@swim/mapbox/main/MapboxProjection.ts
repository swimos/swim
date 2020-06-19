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

import * as mapboxgl from "mapbox-gl";
import {AnyPointR2, PointR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox, GeoProjection} from "@swim/map";

export class MapboxProjection implements GeoProjection {
  /** @hidden */
  readonly _map: mapboxgl.Map;

  constructor(map: mapboxgl.Map) {
    this._map = map;
  }

  get map(): mapboxgl.Map {
    return this._map;
  }

  get bounds(): GeoBox {
    const bounds = this._map.getBounds();
    return new GeoBox(bounds.getWest(), bounds.getSouth(),
                      bounds.getEast(), bounds.getNorth());
  }

  project(geoPoint: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
    let geoPoint: mapboxgl.LngLatLike;
    if (typeof lng === "number") {
      geoPoint = new mapboxgl.LngLat(lng, lat!);
    } else {
      geoPoint = lng;
    }
    const point = this._map.project(geoPoint);
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
    const point = this._map.unproject(viewPoint);
    return new GeoPoint(point.lng, point.lat);
  }
}
