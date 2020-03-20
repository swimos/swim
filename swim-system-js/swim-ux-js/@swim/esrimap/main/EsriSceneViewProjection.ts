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

import * as EsriGeometryPoint from "esri/geometry/Point";
import * as EsriViewsSceneView from "esri/views/SceneView";
import {AnyPointR2, PointR2} from "@swim/math";
import {AnyLngLat, LngLat} from "@swim/map";
import {EsriProjection} from "./EsriProjection";

export class EsriSceneViewProjection implements EsriProjection {
  /** @hidden */
  readonly _map: EsriViewsSceneView;

  constructor(map: EsriViewsSceneView) {
    this._map = map;
  }

  get map(): EsriViewsSceneView {
    return this._map;
  }

  get bounds(): Readonly<[LngLat, LngLat]> {
    const extent = this._map.extent;
    return [new LngLat(extent.xmin, extent.ymin),
            new LngLat(extent.xmax, extent.ymax)];
  }

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    let coord: EsriGeometryPoint;
    if (typeof lng === "number") {
      coord = {x: lng, y: lat!, spatialReference: {wkid: 4326}} as EsriGeometryPoint;
    } else if (Array.isArray(lng)) {
      coord = {x: lng[0], y: lng[1], spatialReference: {wkid: 4326}} as EsriGeometryPoint;
    } else {
      coord = {x: lng.lng, y: lng.lat, spatialReference: {wkid: 4326}} as EsriGeometryPoint;
    }
    const point = this._map.toScreen(coord);
    return new PointR2(point.x, point.y);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    let point: __esri.ScreenPoint;
    if (typeof x === "number") {
      point = {x: x, y: y!};
    } else if (Array.isArray(x)) {
      point = {x: x[0], y: x[1]};
    } else {
      point = x;
    }
    const coord = this._map.toMap(point);
    return new LngLat(coord.longitude, coord.latitude);
  }
}
