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
import {ViewFlags, View, GraphicsViewContext, GraphicsView, CanvasView} from "@swim/view";
import {AnyGeoPoint, GeoPoint, MapGraphicsViewContext, MapGraphicsNodeView} from "@swim/map";
import {EsriProjection} from "./EsriProjection";
import {EsriViewObserver} from "./EsriViewObserver";
import {EsriViewController} from "./EsriViewController";

export abstract class EsriView extends MapGraphicsNodeView {
  constructor() {
    super();
    EsriProjection.init();
  }

  abstract get map(): __esri.View;

  get viewController(): EsriViewController | null {
    return this._viewController;
  }

  abstract project(lnglat: AnyGeoPoint): PointR2;
  abstract project(lng: number, lat: number): PointR2;

  abstract unproject(point: AnyPointR2): GeoPoint;
  abstract unproject(x: number, y: number): GeoPoint;

  abstract get geoProjection(): EsriProjection;

  protected willSetGeoProjection(geoProjection: EsriProjection): void {
    this.willObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewWillSetGeoProjection !== void 0) {
        viewObserver.viewWillSetGeoProjection(geoProjection, this);
      }
    });
  }

  protected onSetGeoProjection(geoProjection: EsriProjection): void {
    if (!this.isHidden() && !this.isCulled()) {
      this.requireUpdate(View.NeedsProject, false);
    }
  }

  protected didSetGeoProjection(geoProjection: EsriProjection): void {
    this.didObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewDidSetGeoProjection !== void 0) {
        viewObserver.viewDidSetGeoProjection(geoProjection, this);
      }
    });
  }

  abstract get mapZoom(): number;

  protected willSetMapZoom(newMapZoom: number, oldMapZoom: number): void {
    this.didObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewWillSetMapZoom !== void 0) {
        viewObserver.viewWillSetMapZoom(newMapZoom, oldMapZoom, this);
      }
    });
  }

  protected onSetMapZoom(newMapZoom: number, oldMapZoom: number): void {
    // hook
  }

  protected didSetMapZoom(newMapZoom: number, oldMapZoom: number): void {
    this.didObserve(function (viewObserver: EsriViewObserver): void {
      if (viewObserver.viewDidSetMapZoom !== void 0) {
        viewObserver.viewDidSetMapZoom(newMapZoom, oldMapZoom, this);
      }
    });
  }

  abstract get mapHeading(): number;

  abstract get mapTilt(): number;

  protected onPower(): void {
    super.onPower();
    this.requireUpdate(View.NeedsProject);
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: GraphicsViewContext): void {
    viewContext = this.mapViewContext(viewContext);
    super.cascadeProcess(processFlags, viewContext);
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: GraphicsViewContext): void {
    viewContext = this.mapViewContext(viewContext);
    super.cascadeDisplay(displayFlags, viewContext);
  }

  childViewContext(childView: View, viewContext: MapGraphicsViewContext): MapGraphicsViewContext {
    return viewContext;
  }

  mapViewContext(viewContext: GraphicsViewContext): MapGraphicsViewContext {
    const mapViewContext = Object.create(viewContext);
    mapViewContext.geoProjection = this.geoProjection;
    mapViewContext.geoFrame = this.geoFrame;
    mapViewContext.mapZoom = this.mapZoom;
    mapViewContext.mapHeading = this.mapHeading;
    mapViewContext.mapTilt = this.mapTilt;
    return mapViewContext;
  }

  hitTest(x: number, y: number, viewContext: GraphicsViewContext): GraphicsView | null {
    viewContext = this.mapViewContext(viewContext);
    return super.hitTest(x, y, viewContext as MapGraphicsViewContext);
  }

  abstract overlayCanvas(): CanvasView | null;
}
