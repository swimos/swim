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

import * as EsriViewsMapView from "esri/views/MapView";
import {AnyPointR2, PointR2} from "@swim/math";
import {View, CanvasView} from "@swim/view";
import {AnyLngLat, LngLat} from "@swim/map";
import {EsriView} from "./EsriView";
import {EsriMapViewProjection} from "./EsriMapViewProjection";
import {EsriMapViewController} from "./EsriMapViewController";

export class EsriMapView extends EsriView {
  /** @hidden */
  readonly _map: EsriViewsMapView;
  /** @hidden */
  _viewController: EsriMapViewController | null;
  /** @hidden */
  _projection: EsriMapViewProjection;
  /** @hidden */
  _zoom: number;
  /** @hidden */
  _heading: number;

  constructor(map: EsriViewsMapView, key: string | null = null) {
    super(key);
    this.onMapRender = this.onMapRender.bind(this);
    this._map = map;
    this._projection = new EsriMapViewProjection(this._map);
    this._zoom = map.zoom;
    this._heading = map.rotation;
    this.initMap(this._map);
  }

  get map(): EsriViewsMapView {
    return this._map;
  }

  protected initMap(map: EsriViewsMapView): void {
    map.watch("extent", this.onMapRender);
  }

  get viewController(): EsriMapViewController | null {
    return this._viewController;
  }

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    return this._projection.project.apply(this._projection, arguments);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    return this._projection.unproject.apply(this._projection, arguments);
  }

  get projection(): EsriMapViewProjection {
    return this._projection;
  }

  setProjection(projection: EsriMapViewProjection): void {
    this.willSetProjection(projection);
    this._projection = projection;
    this.onSetProjection(projection);
    this.didSetProjection(projection);
  }

  get zoom(): number {
    return this._zoom;
  }

  setZoom(newZoom: number): void {
    const oldZoom = this._zoom;
    if (oldZoom !== newZoom) {
      this.willSetZoom(newZoom);
      this._zoom = newZoom;
      this.onSetZoom(newZoom, oldZoom);
      this.didSetZoom(newZoom, oldZoom);
    }
  }

  get heading(): number {
    return this._heading;
  }

  get tilt(): number {
    return 0;
  }

  protected onMapRender(): void {
    this._heading = this._map.rotation;
    this.setZoom(this._map.zoom);
    this.setProjection(this._projection);
  }

  overlayCanvas(): CanvasView | null {
    if (this._parentView) {
      return this.canvasView;
    } else {
      const map = this._map;
      const container = View.fromNode(map.container);
      const esriViewRoot = View.fromNode(container.node.querySelector(".esri-view-root") as HTMLDivElement);
      const esriViewSurface = View.fromNode(esriViewRoot.node.querySelector(".esri-view-surface") as HTMLDivElement);
      const canvas = esriViewSurface.append("canvas");
      canvas.append(this);
      return canvas;
    }
  }
}
