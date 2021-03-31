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

import {Arrays} from "@swim/util";
import {GeoBox, GeoProjection} from "@swim/geo";
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewObserverType,
  ViewWillProject,
  ViewDidProject,
} from "@swim/view";
import {GraphicsViewInit, GraphicsView} from "@swim/graphics";
import type {MapGraphicsViewContext} from "./MapGraphicsViewContext";
import type {MapGraphicsViewObserver} from "./MapGraphicsViewObserver";
import type {MapGraphicsViewController} from "./MapGraphicsViewController";

export interface MapGraphicsViewInit extends GraphicsViewInit {
}

export abstract class MapGraphicsView extends GraphicsView {
  declare readonly viewController: MapGraphicsViewController | null;

  declare readonly viewObservers: ReadonlyArray<MapGraphicsViewObserver>;

  initView(init: MapGraphicsViewInit): void {
    super.initView(init);
  }

  protected onAddViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onAddViewObserver(viewObserver);
    if (viewObserver.viewWillProject !== void 0) {
      this.viewObserverCache.viewWillProjectObservers = Arrays.inserted(viewObserver as ViewWillProject, this.viewObserverCache.viewWillProjectObservers);
    }
    if (viewObserver.viewDidProject !== void 0) {
      this.viewObserverCache.viewDidProjectObservers = Arrays.inserted(viewObserver as ViewDidProject, this.viewObserverCache.viewDidProjectObservers);
    }
  }

  protected onRemoveViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onRemoveViewObserver(viewObserver);
    if (viewObserver.viewWillProject !== void 0) {
      this.viewObserverCache.viewWillProjectObservers = Arrays.removed(viewObserver as ViewWillProject, this.viewObserverCache.viewWillProjectObservers);
    }
    if (viewObserver.viewDidProject !== void 0) {
      this.viewObserverCache.viewDidProjectObservers = Arrays.removed(viewObserver as ViewDidProject, this.viewObserverCache.viewDidProjectObservers);
    }
  }

  get geoProjection(): GeoProjection | null {
    const parentView = this.parentView;
    return parentView instanceof MapGraphicsView ? parentView.geoProjection : null;
  }

  get mapZoom(): number {
    const parentView = this.parentView;
    return parentView instanceof MapGraphicsView ? parentView.mapZoom : 0;
  }

  get mapHeading(): number {
    const parentView = this.parentView;
    return parentView instanceof MapGraphicsView ? parentView.mapHeading : 0;
  }

  get mapTilt(): number {
    const parentView = this.parentView;
    return parentView instanceof MapGraphicsView ? parentView.mapTilt : 0;
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    let cascadeFlags = processFlags;
    this.setViewFlags(this.viewFlags & ~View.NeedsProcess | (View.TraversingFlag | View.ProcessingFlag));
    try {
      this.willProcess(cascadeFlags, viewContext);
      if (((this.viewFlags | processFlags) & View.NeedsResize) !== 0) {
        cascadeFlags |= View.NeedsResize;
        this.setViewFlags(this.viewFlags & ~View.NeedsResize);
        this.willResize(viewContext);
      }
      if (((this.viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        cascadeFlags |= View.NeedsScroll;
        this.setViewFlags(this.viewFlags & ~View.NeedsScroll);
        this.willScroll(viewContext);
      }
      if (((this.viewFlags | processFlags) & View.NeedsChange) !== 0) {
        cascadeFlags |= View.NeedsChange;
        this.setViewFlags(this.viewFlags & ~View.NeedsChange);
        this.willChange(viewContext);
      }
      if (((this.viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        cascadeFlags |= View.NeedsAnimate;
        this.setViewFlags(this.viewFlags & ~View.NeedsAnimate);
        this.willAnimate(viewContext);
      }
      if (((this.viewFlags | processFlags) & View.NeedsLayout) !== 0) {
        cascadeFlags |= View.NeedsLayout;
        this.setViewFlags(this.viewFlags & ~View.NeedsLayout);
        this.willLayout(viewContext);
      }
      if (((this.viewFlags | processFlags) & View.NeedsProject) !== 0) {
        cascadeFlags |= View.NeedsProject;
        this.setViewFlags(this.viewFlags & ~View.NeedsProject);
        this.willProject(viewContext);
      }

      this.onProcess(cascadeFlags, viewContext);
      if ((cascadeFlags & View.NeedsResize) !== 0) {
        this.onResize(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.onScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsChange) !== 0) {
        this.onChange(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.onAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.onLayout(viewContext);
      }
      if ((cascadeFlags & View.NeedsProject) !== 0) {
        this.onProject(viewContext);
      }

      this.doProcessChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsProject) !== 0) {
        this.didProject(viewContext);
      }
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.didLayout(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.didAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsChange) !== 0) {
        this.didChange(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.didScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsResize) !== 0) {
        this.didResize(viewContext);
      }
      this.didProcess(cascadeFlags, viewContext);
    } finally {
      this.setViewFlags(this.viewFlags & ~(View.TraversingFlag | View.ProcessingFlag));
    }
  }

  protected willProject(viewContext: ViewContextType<this>): void {
    const viewController = this.viewController;
    if (viewController !== null) {
      viewController.viewWillProject(viewContext, this);
    }
    const viewObservers = this.viewObserverCache.viewWillProjectObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillProject(viewContext, this);
      }
    }
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didProject(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidProjectObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidProject(viewContext, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null) {
      viewController.viewDidProject(viewContext, this);
    }
  }

  protected onSetHidden(hidden: boolean): void {
    if (!hidden) {
      this.requireUpdate(View.NeedsProject);
    }
  }

  protected didSetHidden(hidden: boolean): void {
    const parentView = this.parentView;
    if (parentView instanceof MapGraphicsView) {
      parentView.childViewDidSetHidden(this, hidden);
    }
    super.didSetHidden(hidden);
  }

  childViewDidSetHidden(childView: MapGraphicsView, hidden: boolean): void {
    // hook
  }

  cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
    this.setCulled(!geoFrame.intersects(this.geoBounds));
  }

  // @ts-ignore
  declare readonly viewContext: MapGraphicsViewContext;

  /**
   * The map-specified geographic bounding box in which this view should layout
   * and render geometry.
   */
  get geoFrame(): GeoBox {
    const parentView = this.parentView;
    return parentView instanceof MapGraphicsView ? parentView.geoFrame : GeoBox.globe();
  }

  /**
   * The self-defined geographic bounding box surrounding all geometry this
   * view could possibly render.  Views with geo bounds that don't overlap
   * their map frames may be culled from rendering and hit testing.
   */
  get geoBounds(): GeoBox {
    return this.geoFrame;
  }

  get ownGeoBounds(): GeoBox | null {
    return null;
  }

  deriveGeoBounds(): GeoBox {
    let geoBounds: GeoBox | null = this.ownGeoBounds;
    type self = this;
    function accumulateGeoBounds(this: self, childView: View): void {
      if (childView instanceof MapGraphicsView && !childView.isHidden()) {
        const childGeoBounds = childView.geoBounds;
        if (childGeoBounds.isDefined()) {
          if (geoBounds !== null) {
            geoBounds = geoBounds.union(childGeoBounds);
          } else {
            geoBounds = childGeoBounds;
          }
        }
      }
    }
    this.forEachChildView(accumulateGeoBounds, this);
    if (geoBounds === null) {
      geoBounds = this.geoFrame;
    }
    return geoBounds;
  }

  protected didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const parentView = this.parentView;
    if (parentView instanceof MapGraphicsView) {
      parentView.childViewDidSetGeoBounds(this, newGeoBounds, oldGeoBounds);
    }
  }

  childViewDidSetGeoBounds(childView: MapGraphicsView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    // hook
  }

  static readonly mountFlags: ViewFlags = GraphicsView.mountFlags | View.NeedsProject;
  static readonly uncullFlags: ViewFlags = GraphicsView.uncullFlags | View.NeedsProject;
}
