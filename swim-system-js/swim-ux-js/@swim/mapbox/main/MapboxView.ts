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
import {AnyPointR2, PointR2} from "@swim/math";
import {View, RenderViewContext, CanvasView} from "@swim/view";
import {AnyLngLat, LngLat, MapViewContext, MapView, MapGraphicView} from "@swim/map";
import {MapboxProjection} from "./MapboxProjection";
import {MapboxViewObserver} from "./MapboxViewObserver";
import {MapboxViewController} from "./MapboxViewController";

export class MapboxView extends MapGraphicView {
  /** @hidden */
  readonly _map: mapboxgl.Map;
  /** @hidden */
  _viewController: MapboxViewController | null;
  /** @hidden */
  _projection: MapboxProjection;
  /** @hidden */
  _zoom: number;

  constructor(map: mapboxgl.Map, key: string | null = null) {
    super(key);
    this.onMapLoad = this.onMapLoad.bind(this);
    this.onMapRender = this.onMapRender.bind(this);
    this.onMapZoom = this.onMapZoom.bind(this);
    this._map = map;
    this._projection = new MapboxProjection(this._map);
    this._zoom = map.getZoom();
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

  get viewController(): MapboxViewController | null {
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

  get projection(): MapboxProjection {
    return this._projection;
  }

  setProjection(projection: MapboxProjection): void {
    const newProjection = this.willSetProjection(projection);
    if (newProjection !== void 0) {
      projection = newProjection;
    }
    this._projection = projection;
    this.onSetProjection(projection);
    this.didSetProjection(projection);
  }

  protected willSetProjection(projection: MapboxProjection): MapboxProjection | void {
    const viewController = this._viewController;
    if (viewController) {
      const newProjection = viewController.viewWillSetProjection(projection, this);
      if (newProjection !== void 0) {
        projection = newProjection;
      }
    }
    const viewObservers = this._viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i] as MapboxViewObserver;
      if (viewObserver.viewWillSetProjection) {
        viewObserver.viewWillSetProjection(projection, this);
      }
    }
  }

  protected onSetProjection(projection: MapboxProjection): void {
    this.requireUpdate(MapView.NeedsProject, true);
  }

  protected didSetProjection(projection: MapboxProjection): void {
    this.didObserve(function (viewObserver: MapboxViewObserver): void {
      if (viewObserver.viewDidSetProjection) {
        viewObserver.viewDidSetProjection(projection, this);
      }
    });
  }

  get zoom(): number {
    return this._zoom;
  }

  setZoom(zoom: number): void {
    this.willSetZoom(zoom);
    const oldZoom = this._zoom;
    this._zoom = zoom;
    this.onSetZoom(zoom, oldZoom);
    this.didSetZoom(zoom, oldZoom);
  }

  protected willSetZoom(zoom: number): void {
    this.didObserve(function (viewObserver: MapboxViewObserver): void {
      if (viewObserver.viewWillSetZoom) {
        viewObserver.viewWillSetZoom(zoom, this);
      }
    });
  }

  protected onSetZoom(newZoom: number, oldZoom: number): void {
    // hook
  }

  protected didSetZoom(newZoom: number, oldZoom: number): void {
    this.didObserve(function (viewObserver: MapboxViewObserver): void {
      if (viewObserver.viewDidSetZoom) {
        viewObserver.viewDidSetZoom(newZoom, oldZoom, this);
      }
    });
  }

  /** @hidden */
  doUpdate(updateFlags: number, viewContext: RenderViewContext): void {
    const mapViewContext = this.mapViewContext(viewContext);
    this.willUpdate(mapViewContext);
    if (((updateFlags | this._updateFlags) & View.NeedsCompute) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsCompute;
      this.doCompute(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsAnimate) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsAnimate;
      this.doAnimate(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & MapView.NeedsProject) !== 0) {
      this._updateFlags = this._updateFlags & ~MapView.NeedsProject;
      this.doProject(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsLayout) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsLayout;
      this.doLayout(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsScroll) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsScroll;
      this.doScroll(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsRender) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsRender;
      this.doRender(mapViewContext);
    }
    this.onUpdate(viewContext);
    this.doUpdateChildViews(updateFlags, mapViewContext);
    this.didUpdate(mapViewContext);
  }

  childViewContext(childView: View, viewContext: MapViewContext): MapViewContext {
    return viewContext;
  }

  mapViewContext(viewContext: RenderViewContext): MapViewContext {
    return {
      updateTime: viewContext.updateTime,
      viewport: viewContext.viewport,
      viewIdiom: viewContext.viewIdiom,
      renderingContext: viewContext.renderingContext,
      pixelRatio: viewContext.pixelRatio,
      projection: this._projection,
      zoom: this._zoom,
    };
  }

  protected onMapLoad(): void {
    const map = this._map;
    map.off("load", this.onMapLoad);
    // hook
  }

  protected onMapRender(): void {
    this.setProjection(this._projection);
  }

  protected onMapZoom(): void {
    this.setZoom(this._map.getZoom());
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
