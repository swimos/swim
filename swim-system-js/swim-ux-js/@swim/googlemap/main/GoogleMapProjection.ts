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

import {AnyPointR2, PointR2} from "@swim/math";
import {AnyLngLat, LngLat, MapProjection} from "@swim/map";
import {GoogleMapView} from "./GoogleMapView";

export class GoogleMapProjection implements MapProjection {
  /** @hidden */
  readonly _mapView: GoogleMapView;

  constructor(mapView: GoogleMapView) {
    this._mapView = mapView;
  }

  get map(): google.maps.Map {
    return this._mapView._map;
  }

  get bounds(): Readonly<[LngLat, LngLat]> {
    const mapBounds = this._mapView._map.getBounds()!;
    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();
    return [new LngLat(sw.lng(), sw.lat()),
            new LngLat(ne.lng(), ne.lat())];
  }

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    let coord: google.maps.LatLng;
    if (typeof lng === "number") {
      coord = new google.maps.LatLng(lat!, lng);
    } else if (Array.isArray(lng)) {
      coord = new google.maps.LatLng(lng[1], lng[0]);
    } else {
      coord = new google.maps.LatLng(lng.lat, lng.lng);
    }
    const projection = this._mapView._overlay!.getProjection()!;
    const point = projection.fromLatLngToContainerPixel(coord);
    return new PointR2(point.x, point.y);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    let point: google.maps.Point;
    if (typeof x === "number") {
      point = new google.maps.Point(x, y!);
    } else if (Array.isArray(x)) {
      point = new google.maps.Point(x[0], x[1]);
    } else {
      point = new google.maps.Point(x.x, x.y);
    }
    const projection = this._mapView._overlay!.getProjection()!;
    const coord = projection.fromContainerPixelToLatLng(point);
    return new LngLat(coord.lng(), coord.lat());
  }
}
