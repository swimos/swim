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

import {BoxR2} from "@swim/math";
import {View, RenderedViewContext, RenderedView, GraphicsView} from "@swim/view";
import {MapProjection} from "./MapProjection";
import {MapViewContext} from "./MapViewContext";
import {MapView} from "./MapView";
import {MapViewObserver} from "./MapViewObserver";
import {MapGraphicsViewController} from "./MapGraphicsViewController";

export class MapGraphicsView extends GraphicsView implements MapView {
  /** @hidden */
  _viewController: MapGraphicsViewController | null;
  /** @Hidden */
  _hitBounds: BoxR2 | null;

  constructor(key: string | null = null) {
    super(key);
    this._hitBounds = null;
  }

  get viewController(): MapGraphicsViewController | null {
    return this._viewController;
  }

  get projection(): MapProjection | null {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.projection : null;
  }

  get zoom(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.zoom : 0;
  }

  get heading(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.heading : 0;
  }

  get tilt(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.tilt : 0;
  }

  needsUpdate(updateFlags: number, viewContext: MapViewContext): number {
    if ((updateFlags & MapView.NeedsProject) !== 0) {
      updateFlags = updateFlags | View.NeedsAnimate | View.NeedsLayout;
    }
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout)) !== 0) {
      updateFlags = updateFlags | View.NeedsRender;
    }
    return updateFlags;
  }

  /** @hidden */
  doUpdate(updateFlags: number, viewContext: MapViewContext): void {
    this.willUpdate(viewContext);
    if (((updateFlags | this._updateFlags) & View.NeedsCompute) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsCompute;
      this.doCompute(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsAnimate) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsAnimate;
      this.doAnimate(viewContext);
    }
    if (((updateFlags | this._updateFlags) & MapView.NeedsProject) !== 0) {
      this._updateFlags = this._updateFlags & ~MapView.NeedsProject;
      this.doProject(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsLayout) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsLayout;
      this.doLayout(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsScroll) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsScroll;
      this.doScroll(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsRender) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsRender;
      this.doRender(viewContext);
    }
    this.onUpdate(viewContext);
    this.doUpdateChildViews(updateFlags, viewContext);
    this.didUpdate(viewContext);
  }

  /** @hidden */
  doProject(viewContext: MapViewContext): void {
    if (this.parentView) {
      this.willProject(viewContext);
      this.onProject(viewContext);
      this.didProject(viewContext);
    }
  }

  protected willProject(viewContext: MapViewContext): void {
    this.willObserve(function (viewObserver: MapViewObserver): void {
      if (viewObserver.viewWillProject) {
        viewObserver.viewWillProject(viewContext, this);
      }
    });
  }

  protected onProject(viewContext: MapViewContext): void {
    // hook
  }

  protected didProject(viewContext: MapViewContext): void {
    this.didObserve(function (viewObserver: MapViewObserver): void {
      if (viewObserver.viewDidProject) {
        viewObserver.viewDidProject(viewContext, this);
      }
    });
  }

  protected layoutChildView(childView: View, viewContext: RenderedViewContext): void {
    if (RenderedView.is(childView)) {
      childView.setBounds(this._bounds);
      // Don't set anchor.
    }
  }

  childViewContext(childView: View, viewContext: MapViewContext): MapViewContext {
    return viewContext;
  }

  get hitBounds(): BoxR2 | null {
    return this._hitBounds;
  }

  protected computeHitBounds(): void {
    let hitBounds: BoxR2 | null = null;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (RenderedView.is(childView)) {
        const childHitBounds = childView.hitBounds;
        if (childHitBounds) {
          hitBounds = hitBounds ? hitBounds.union(childHitBounds) : childHitBounds;
        }
      }
    }
    this._hitBounds = hitBounds;
  }

  protected cullHitBounds(): void {
    const hitBounds = this._hitBounds;
    if (hitBounds !== null) {
      const culled = !this._bounds.intersects(hitBounds);
      this.setCulled(culled);
    }
  }
}
