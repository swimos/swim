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

import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {View, RenderView, GraphicView} from "@swim/view";
import {AnyLngLat, LngLat} from "./LngLat";
import {MapProjection} from "./MapProjection";
import {MapView} from "./MapView";
import {MapViewObserver} from "./MapViewObserver";
import {MapGraphicViewController} from "./MapGraphicViewController";

export class MapGraphicView extends GraphicView implements MapView {
  /** @hidden */
  _viewController: MapGraphicViewController | null;
  /** @hidden */
  _projection: MapProjection;
  /** @hidden */
  _zoom: number;
  /** @Hidden */
  _hitBounds: BoxR2 | null;
  /** @hidden */
  _dirtyProjection: boolean;

  constructor(key: string | null = null) {
    super(key);
    this._projection = MapProjection.identity();
    this._hitBounds = null;
    this._dirtyProjection = true;
  }

  get viewController(): MapGraphicViewController | null {
    return this._viewController;
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    if (RenderView.is(childView)) {
      this.setChildViewBounds(childView, this._bounds);
      if (MapView.is(childView)) {
        this.setChildViewProjection(childView, this._projection);
        this.setChildViewZoom(childView, this._zoom);
      }
      if (this._culled) {
        childView.setCulled(true);
      }
    }
  }

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    return this.projection.project.apply(this.projection, arguments);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    return this.projection.unproject.apply(this.projection, arguments);
  }

  get projection(): MapProjection {
    return this._projection;
  }

  setProjection(projection: MapProjection): void {
    const newProjection = this.willSetProjection(projection);
    if (newProjection !== void 0) {
      projection = newProjection;
    }
    this._projection = projection;
    this._dirtyProjection = true;
    this.onSetProjection(projection);
    const childViews = this.childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (MapView.is(childView)) {
        this.setChildViewProjection(childView, projection);
      }
    }
    this.didSetProjection(projection);
  }

  protected willSetProjection(projection: MapProjection): MapProjection | void {
    const viewController = this._viewController;
    if (viewController) {
      const newProjection = viewController.viewWillSetProjection(projection, this);
      if (newProjection !== void 0) {
        projection = newProjection;
      }
    }
    const viewObservers = this._viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i] as MapViewObserver;
      if (viewObserver.viewWillSetProjection) {
        viewObserver.viewWillSetProjection(projection, this);
      }
    }
  }

  protected onSetProjection(projection: MapProjection): void {
    // hook
  }

  protected didSetProjection(projection: MapProjection): void {
    this.didObserve(function (viewObserver: MapViewObserver): void {
      if (viewObserver.viewDidSetProjection) {
        viewObserver.viewDidSetProjection(projection, this);
      }
    });
  }

  protected setChildViewProjection(childView: MapView, projection: MapProjection): void {
    childView.setProjection(projection);
  }

  get zoom(): number {
    return this._zoom;
  }

  setZoom(zoom: number): void {
    this.willSetZoom(zoom);
    const oldZoom = this._zoom;
    this._zoom = zoom;
    this.onSetZoom(zoom, oldZoom);
    const childViews = this.childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (MapView.is(childView)) {
        this.setChildViewZoom(childView, zoom);
      }
    }
    this.didSetZoom(zoom, oldZoom);
  }

  protected willSetZoom(zoom: number): void {
    this.didObserve(function (viewObserver: MapViewObserver): void {
      if (viewObserver.viewWillSetZoom) {
        viewObserver.viewWillSetZoom(zoom, this);
      }
    });
  }

  protected onSetZoom(newZoom: number, oldZoom: number): void {
    if (newZoom !== oldZoom) {
      this.setDirty(true);
    }
  }

  protected didSetZoom(newZoom: number, oldZoom: number): void {
    this.didObserve(function (viewObserver: MapViewObserver): void {
      if (viewObserver.viewDidSetZoom) {
        viewObserver.viewDidSetZoom(newZoom, oldZoom, this);
      }
    });
  }

  protected setChildViewZoom(childView: MapView, zoom: number): void {
    childView.setZoom(zoom);
  }

  protected onAnimate(t: number): void {
    this.projectGeometry();
  }

  protected didAnimate(t: number): void {
    super.didAnimate(t);
    this._dirtyProjection = false;
  }

  protected onCull(): void {
    const hitBounds = this._hitBounds;
    if (hitBounds !== null) {
      const culled = !this._bounds.intersects(hitBounds);
      this.setCulled(culled);
    }
  }

  protected projectGeometry(): void {
    let hitBounds: BoxR2 | null = null;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (RenderView.is(childView)) {
        const childHitBounds = childView.hitBounds;
        if (childHitBounds) {
          hitBounds = hitBounds ? hitBounds.union(childHitBounds) : childHitBounds;
        }
      }
    }
    this._hitBounds = hitBounds;
  }

  get hitBounds(): BoxR2 | null {
    return this._hitBounds;
  }
}
