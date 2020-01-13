// Copyright 2015-2020 SWIM.AI inc.
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
import {AnyLngLat, LngLat, MapProjection} from "@swim/map";

export class MapboxProjection implements MapProjection {
  /** @hidden */
  readonly _map: mapboxgl.Map;

  constructor(map: mapboxgl.Map) {
    this._map = map;
  }

  get map(): mapboxgl.Map {
    return this._map;
  }

  get bounds(): Readonly<[LngLat, LngLat]> {
    const mapBounds = this._map.getBounds();
    return [new LngLat(mapBounds.getWest(), mapBounds.getSouth()),
            new LngLat(mapBounds.getEast(), mapBounds.getNorth())];
  }

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    let coord: mapboxgl.LngLatLike;
    if (typeof lng === "number") {
      coord = new mapboxgl.LngLat(lng, lat!);
    } else {
      coord = lng;
    }
    const {x, y} = this._map.project(coord);
    return new PointR2(x, y);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    let point: mapboxgl.PointLike;
    if (typeof x === "number") {
      point = new mapboxgl.Point(x, y!);
    } else if (Array.isArray(x)) {
      point = x;
    } else {
      point = new mapboxgl.Point(x.x, x.y);
    }
    const {lng, lat} = this._map.unproject(point);
    return new LngLat(lng, lat);
  }
}
