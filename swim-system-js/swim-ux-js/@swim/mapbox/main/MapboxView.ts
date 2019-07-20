// Copyright 2015-2019 SWIM.AI inc.
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
import {View, RenderView, CanvasView} from "@swim/view";
import {MapView, MapGraphicView, MapGraphicViewController} from "@swim/map";
import {MapboxProjection} from "./MapboxProjection";

export class MapboxView extends MapGraphicView {
  /** @hidden */
  readonly _map: mapboxgl.Map;
  /** @hidden */
  _viewController: MapGraphicViewController<MapboxView> | null;
  /** @hidden */
  _zoomTimer: number;

  constructor(map: mapboxgl.Map, key: string | null = null) {
    super(key);
    this.doZoom = this.doZoom.bind(this);
    this.onMapLoad = this.onMapLoad.bind(this);
    this.onMapRender = this.onMapRender.bind(this);
    this.onMapZoom = this.onMapZoom.bind(this);
    this._map = map;
    this._projection = new MapboxProjection(this._map);
    this._zoom = map.getZoom();
    this._zoomTimer = 0;
    this.initMap(this._map);
  }

  get map(): mapboxgl.Map {
    return this._map;
  }

  protected initMap(map: mapboxgl.Map): void {
    map.on("load", this.onMapLoad);
    map.on("zoom", this.onMapZoom);
    map.on("render", this.onMapRender);
  }

  get viewController(): MapGraphicViewController<MapboxView> | null {
    return this._viewController;
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (RenderView.is(childView)) {
      this.setChildViewBounds(childView, this._bounds);
      if (MapView.is(childView)) {
        this.setChildViewProjection(childView, this._projection);
      }
      if (this._culled) {
        childView.setCulled(true);
      } else {
        childView.cascadeCull();
      }
    }
  }

  /** @hidden */
  throttleZoom(): void {
    if (!this._zoomTimer) {
      this._zoomTimer = setTimeout(this.doZoom, 500) as any;
    }
  }

  /** @hidden */
  doZoom(): void {
    this._zoomTimer = 0;
    this.setZoom(this._map.getZoom());
  }

  protected onMapLoad(): void {
    const map = this._map;
    map.off("load", this.onMapLoad);
    // hook
  }

  protected onMapRender(): void {
    this.setProjection(this._projection);
    const canvasView = this.canvasView;
    if (canvasView) {
      canvasView.animate(true);
    }
  }

  protected onMapZoom(): void {
    this.throttleZoom();
  }

  overlayCanvas(): CanvasView | null {
    if (this._parentView) {
      return this.canvasView;
    } else {
      const map = this._map;
      View.fromNode(map.getContainer());
      const canvasContainer = View.fromNode(map.getCanvasContainer());
      const canvas = canvasContainer.append("canvas");
      canvas.append(this);
      return canvas;
    }
  }
}
