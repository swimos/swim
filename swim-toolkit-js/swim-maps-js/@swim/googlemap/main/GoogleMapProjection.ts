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
import {AnyGeoPoint, GeoPoint, GeoBox, GeoProjection} from "@swim/map";
import {GoogleMapView} from "./GoogleMapView";

export class GoogleMapProjection implements GeoProjection {
  /** @hidden */
  readonly _mapView: GoogleMapView;

  constructor(mapView: GoogleMapView) {
    this._mapView = mapView;
  }

  get map(): google.maps.Map {
    return this._mapView._map;
  }

  get bounds(): GeoBox {
    const bounds = this._mapView._map.getBounds()!;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return new GeoBox(sw.lng(), sw.lat(), ne.lng(), ne.lat());
  }

  project(geoPoint: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
    let geoPoint: google.maps.LatLng;
    if (typeof lng === "number") {
      geoPoint = new google.maps.LatLng(lat!, lng);
    } else if (Array.isArray(lng)) {
      geoPoint = new google.maps.LatLng(lng[1], lng[0]);
    } else {
      geoPoint = new google.maps.LatLng(lng.lat, lng.lng);
    }
    const projection = this._mapView._mapOverlay!.getProjection()!;
    const point = projection.fromLatLngToContainerPixel(geoPoint);
    return new PointR2(point.x, point.y);
  }

  unproject(viewPoint: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyPointR2 | number, y?: number): GeoPoint {
    let viewPoint: google.maps.Point;
    if (typeof x === "number") {
      viewPoint = new google.maps.Point(x, y!);
    } else if (Array.isArray(x)) {
      viewPoint = new google.maps.Point(x[0], x[1]);
    } else {
      viewPoint = new google.maps.Point(x.x, x.y);
    }
    const projection = this._mapView._mapOverlay!.getProjection()!;
    const point = projection.fromContainerPixelToLatLng(viewPoint);
    return new GeoPoint(point.lng(), point.lat());
  }
}
