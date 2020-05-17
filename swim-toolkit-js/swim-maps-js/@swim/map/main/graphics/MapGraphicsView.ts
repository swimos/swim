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

import {ViewFlags, View, GraphicsView} from "@swim/view";
import {GeoBox} from "../geo/GeoBox";
import {GeoProjection} from "../geo/GeoProjection";
import {MapViewContext} from "../MapViewContext";
import {MapView} from "../MapView";
import {MapGraphicsViewObserver} from "./MapGraphicsViewObserver";
import {MapGraphicsViewController} from "./MapGraphicsViewController";

export class MapGraphicsView extends GraphicsView implements MapView {
  get viewController(): MapGraphicsViewController | null {
    return this._viewController;
  }

  get geoProjection(): GeoProjection | null {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.geoProjection : null;
  }

  get mapZoom(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.mapZoom : 0;
  }

  get mapHeading(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.mapHeading : 0;
  }

  get mapTilt(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.mapTilt : 0;
  }

  protected onMount(): void {
    super.onMount();
    this.requireUpdate(View.NeedsProject);
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsProject) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  needsProcess(processFlags: ViewFlags, viewContext: MapViewContext): ViewFlags {
    if ((this._viewFlags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: MapViewContext): void {
    let cascadeFlags = processFlags;
    this._viewFlags &= ~(View.NeedsProcess | View.NeedsResize);
    this.willProcess(viewContext);
    this._viewFlags |= View.ProcessingFlag;
    try {
      if (((this._viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        cascadeFlags |= View.NeedsScroll;
        this._viewFlags &= ~View.NeedsScroll;
        this.willScroll(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsDerive) !== 0) {
        cascadeFlags |= View.NeedsDerive;
        this._viewFlags &= ~View.NeedsDerive;
        this.willDerive(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        cascadeFlags |= View.NeedsAnimate;
        this._viewFlags &= ~View.NeedsAnimate;
        this.willAnimate(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsProject) !== 0) {
        cascadeFlags |= View.NeedsProject;
        this._viewFlags &= ~View.NeedsProject;
        this.willProject(viewContext);
      }

      this.onProcess(viewContext);
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.onScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.onDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.onAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsProject) !== 0) {
        this.onProject(viewContext);
      }

      this.doProcessChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsProject) !== 0) {
        this.didProject(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.didAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.didDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.didScroll(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.ProcessingFlag;
      this.didProcess(viewContext);
    }
  }

  protected willProject(viewContext: MapViewContext): void {
    this.willObserve(function (viewObserver: MapGraphicsViewObserver): void {
      if (viewObserver.viewWillProject !== void 0) {
        viewObserver.viewWillProject(viewContext, this);
      }
    });
  }

  protected onProject(viewContext: MapViewContext): void {
    // hook
  }

  protected didProject(viewContext: MapViewContext): void {
    this.didObserve(function (viewObserver: MapGraphicsViewObserver): void {
      if (viewObserver.viewDidProject !== void 0) {
        viewObserver.viewDidProject(viewContext, this);
      }
    });
  }

  cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
    this.setCulled(!geoFrame.intersects(this.geoBounds));
  }

  get geoFrame(): GeoBox {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.geoFrame : GeoBox.globe();
  }

  get geoBounds(): GeoBox {
    return this.geoFrame;
  }

  deriveGeoBounds(): GeoBox {
    let geoBounds: GeoBox | undefined;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (MapView.is(childView) && !childView.isHidden()) {
        const childGeoBounds = childView.geoBounds;
        if (geoBounds === void 0) {
          geoBounds = childGeoBounds;
        } else {
          geoBounds = geoBounds.union(childGeoBounds);
        }
      }
    }
    if (geoBounds === void 0) {
      geoBounds = this.geoFrame;
    }
    return geoBounds;
  }

  protected didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const parentView = this._parentView;
    if (MapView.is(parentView)) {
      parentView.childViewDidSetGeoBounds(this, newGeoBounds, oldGeoBounds);
    }
  }

  childViewDidSetGeoBounds(childView: MapView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    // nop
  }
}
