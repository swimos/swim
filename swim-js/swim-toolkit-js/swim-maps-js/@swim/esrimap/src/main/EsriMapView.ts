// Copyright 2015-2021 Swim Inc.
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

import {Mutable, Class, Equivalent, AnyTiming, Timing} from "@swim/util";
import type {MemberFastenerClass} from "@swim/fastener";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {AnyGeoPerspective} from "@swim/map";
import {EsriView} from "./EsriView";
import {EsriMapViewport} from "./EsriMapViewport";
import type {EsriMapViewObserver} from "./EsriMapViewObserver";

/** @public */
export class EsriMapView extends EsriView {
  constructor(map: __esri.MapView) {
    super();
    this.map = map;
    Object.defineProperty(this, "geoViewport", {
      value: EsriMapViewport.create(map),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.onMapRender = this.onMapRender.bind(this);
    this.initMap(map);
  }

  override readonly observerType?: Class<EsriMapViewObserver>;

  override readonly map: __esri.MapView;

  protected initMap(map: __esri.MapView): void {
    map.watch("extent", this.onMapRender);
  }

  override readonly geoViewport!: EsriMapViewport;

  protected willSetGeoViewport(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport): void {
    this.callObservers("viewWillSetGeoViewport", newGeoViewport, oldGeoViewport, this);
  }

  protected onSetGeoViewport(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport): void {
    this.callObservers("viewDidSetGeoViewport", newGeoViewport, oldGeoViewport, this);
  }

  protected updateGeoViewport(): boolean {
    const oldGeoViewport = this.geoViewport;
    const newGeoViewport = EsriMapViewport.create(this.map);
    if (!newGeoViewport.equals(oldGeoViewport)) {
      this.willSetGeoViewport(newGeoViewport, oldGeoViewport);
      (this as Mutable<this>).geoViewport = newGeoViewport;
      this.onSetGeoViewport(newGeoViewport, oldGeoViewport);
      this.didSetGeoViewport(newGeoViewport, oldGeoViewport);
      return true;
    }
    return false;
  }

  protected onMapRender(): void {
    if (this.updateGeoViewport()) {
      const immediate = !this.isHidden() && !this.culled;
      this.requireUpdate(View.NeedsProject, immediate);
    }
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    const target: __esri.GoToTarget2D = {};
    const options: __esri.GoToOptions2D = {};
    const geoViewport = this.geoViewport;
    let geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== void 0 && geoCenter !== null) {
      geoCenter = GeoPoint.fromAny(geoCenter);
      if (!geoViewport.geoCenter.equivalentTo(geoCenter, 1e-5)) {
        target.center = [geoCenter.lng, geoCenter.lat];
      }
    }
    const zoom = geoPerspective.zoom;
    if (zoom !== void 0 && !Equivalent(geoViewport.zoom, zoom, 1e-5)) {
      target.zoom = zoom;
    }
    const heading = geoPerspective.heading;
    if (heading !== void 0 && !Equivalent(geoViewport.heading, heading, 1e-5)) {
      target.heading = heading;
    }
    const tilt = geoPerspective.tilt;
    if (tilt !== void 0 && !Equivalent(geoViewport.tilt, tilt, 1e-5)) {
      target.tilt = tilt;
    }
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    if (timing instanceof Timing) {
      options.duration = timing.duration;
    }
    this.map.goTo(target, options);
  }

  @ViewRef<EsriMapView, CanvasView>({
    extends: true,
    didAttachView(canvasView: CanvasView, targetView: View | null): void {
      if (this.owner.parent === null) {
        canvasView.appendChild(this.owner);
        canvasView.setEventNode(this.owner.map.container.querySelector(".esri-view-root") as HTMLElement);
      }
      EsriView.canvas.prototype.didAttachView.call(this, canvasView, targetView);
    },
    willDetachView(canvasView: CanvasView): void {
      EsriView.canvas.prototype.willDetachView.call(this, canvasView);
      if (this.owner.parent === canvasView) {
        canvasView.removeChild(this.owner);
      }
    },
  })
  override readonly canvas!: ViewRef<this, CanvasView>;
  static override readonly canvas: MemberFastenerClass<EsriMapView, "canvas">;

  @ViewRef<EsriMapView, HtmlView>({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      const esriContainerView = HtmlView.fromNode(this.owner.map.container);
      const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
      const esriSurfaceView = HtmlView.fromNode(esriRootView.node.querySelector(".esri-overlay-surface") as HTMLDivElement);
      this.owner.canvas.insertView(esriSurfaceView);
      EsriView.container.prototype.didAttachView.call(this, containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      EsriView.container.prototype.willDetachView.call(this, containerView);
      const canvasView = this.owner.canvas.view;
      const esriContainerView = HtmlView.fromNode(this.owner.map.container);
      const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
      const esriSurfaceView = HtmlView.fromNode(esriRootView.node.querySelector(".esri-overlay-surface") as HTMLDivElement);
      if (canvasView !== null && canvasView.parent === esriSurfaceView) {
        esriSurfaceView.removeChild(containerView);
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView>;
  static override readonly container: MemberFastenerClass<EsriMapView, "container">;
}
