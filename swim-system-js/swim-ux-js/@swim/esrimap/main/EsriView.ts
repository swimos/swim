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

import * as EsriViewsView from "esri/views/View";
import {AnyPointR2, PointR2} from "@swim/math";
import {View, RenderedViewContext, CanvasView} from "@swim/view";
import {AnyLngLat, LngLat, MapViewContext, MapView, MapGraphicsView} from "@swim/map";
import {EsriProjection} from "./EsriProjection";
import {EsriViewObserver} from "./EsriViewObserver";
import {EsriViewController} from "./EsriViewController";

export abstract class EsriView extends MapGraphicsView {
  /** @hidden */
  _viewController: EsriViewController | null;

  constructor(key: string | null = null) {
    super(key);
  }

  abstract get map(): EsriViewsView;

  get viewController(): EsriViewController | null {
    return this._viewController;
  }

  abstract project(lnglat: AnyLngLat): PointR2;
  abstract project(lng: number, lat: number): PointR2;

  abstract unproject(point: AnyPointR2): LngLat;
  abstract unproject(x: number, y: number): LngLat;

  abstract get projection(): EsriProjection;

  protected willSetProjection(projection: EsriProjection): void {
    this.willObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewWillSetProjection) {
        viewObserver.viewWillSetProjection(projection, this);
      }
    });
  }

  protected onSetProjection(projection: EsriProjection): void {
    this.requireUpdate(MapView.NeedsProject, true);
  }

  protected didSetProjection(projection: EsriProjection): void {
    this.didObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewDidSetProjection) {
        viewObserver.viewDidSetProjection(projection, this);
      }
    });
  }

  abstract get zoom(): number;

  protected willSetZoom(zoom: number): void {
    this.didObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewWillSetZoom) {
        viewObserver.viewWillSetZoom(zoom, this);
      }
    });
  }

  protected onSetZoom(newZoom: number, oldZoom: number): void {
    // hook
  }

  protected didSetZoom(newZoom: number, oldZoom: number): void {
    this.didObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewDidSetZoom) {
        viewObserver.viewDidSetZoom(newZoom, oldZoom, this);
      }
    });
  }

  abstract get heading(): number;

  abstract get tilt(): number;

  /** @hidden */
  doUpdate(updateFlags: number, viewContext: RenderedViewContext): void {
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

  mapViewContext(viewContext: RenderedViewContext): MapViewContext {
    const mapViewContext = Object.create(viewContext);
    mapViewContext.projection = this.projection;
    mapViewContext.zoom = this.zoom;
    mapViewContext.heading = this.heading;
    mapViewContext.tilt = this.tilt;
    return mapViewContext;
  }

  abstract overlayCanvas(): CanvasView | null;
}
