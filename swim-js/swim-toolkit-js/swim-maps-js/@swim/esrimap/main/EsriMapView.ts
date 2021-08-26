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

/// <reference types="arcgis-js-api"/>

import {Equivalent} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {AnyGeoPerspective} from "@swim/map";
import {EsriView} from "./EsriView";
import {EsriMapViewport} from "./EsriMapViewport";
import type {EsriMapViewObserver} from "./EsriMapViewObserver";
import type {EsriMapViewController} from "./EsriMapViewController";

export class EsriMapView extends EsriView {
  constructor(map: __esri.MapView) {
    super();
    Object.defineProperty(this, "map", {
      value: map,
      enumerable: true,
    });
    Object.defineProperty(this, "geoViewport", {
      value: EsriMapViewport.create(map),
      enumerable: true,
      configurable: true,
    });
    this.onMapRender = this.onMapRender.bind(this);
    this.initMap(map);
  }

  override readonly viewController!: EsriMapViewController | null;

  override readonly viewObservers!: ReadonlyArray<EsriMapViewObserver>;

  override readonly map!: __esri.MapView;

  protected initMap(map: __esri.MapView): void {
    map.watch("extent", this.onMapRender);
  }

  override readonly geoViewport!: EsriMapViewport;

  protected willSetGeoViewport(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetGeoViewport !== void 0) {
      viewController.viewWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGeoViewport !== void 0) {
        viewObserver.viewWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected onSetGeoViewport(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!
      if (viewObserver.viewDidSetGeoViewport !== void 0) {
        viewObserver.viewDidSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetGeoViewport !== void 0) {
      viewController.viewDidSetGeoViewport(newGeoViewport, oldGeoViewport, this);
    }
  }

  protected updateGeoViewport(): boolean {
    const oldGeoViewport = this.geoViewport;
    const newGeoViewport = EsriMapViewport.create(this.map);
    if (!newGeoViewport.equals(oldGeoViewport)) {
      this.willSetGeoViewport(newGeoViewport, oldGeoViewport);
      Object.defineProperty(this, "geoViewport", {
        value: newGeoViewport,
        enumerable: true,
        configurable: true,
      });
      this.onSetGeoViewport(newGeoViewport, oldGeoViewport);
      this.didSetGeoViewport(newGeoViewport, oldGeoViewport);
      return true;
    }
    return false;
  }

  protected onMapRender(): void {
    if (this.updateGeoViewport()) {
      const immediate = !this.isHidden() && !this.isCulled();
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

  protected override attachCanvas(canvasView: CanvasView): void {
    super.attachCanvas(canvasView);
    if (this.parentView === null) {
      canvasView.appendChildView(this);
      canvasView.setEventNode(this.map.container.querySelector(".esri-view-root") as HTMLElement);
    }
  }

  protected override detachCanvas(canvasView: CanvasView): void {
    if (this.parentView === canvasView) {
      canvasView.removeChildView(this);
    }
    super.detachCanvas(canvasView);
  }

  protected override initContainer(containerView: HtmlView): void {
    super.initContainer(containerView);
    const esriContainerView = HtmlView.fromNode(this.map.container);
    const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
    HtmlView.fromNode(esriRootView.node.querySelector(".esri-overlay-surface") as HTMLDivElement);
  }

  protected override attachContainer(containerView: HtmlView): void {
    super.attachContainer(containerView);
    const esriContainerView = HtmlView.fromNode(this.map.container);
    const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
    const esriSurfaceView = HtmlView.fromNode(esriRootView.node.querySelector(".esri-overlay-surface") as HTMLDivElement);
    this.canvas.injectView(esriSurfaceView);
  }

  protected override detachContainer(containerView: HtmlView): void {
    const canvasView = this.canvas.view;
    const esriContainerView = HtmlView.fromNode(this.map.container);
    const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
    const esriSurfaceView = HtmlView.fromNode(esriRootView.node.querySelector(".esri-overlay-surface") as HTMLDivElement);
    if (canvasView !== null && canvasView.parentView === esriSurfaceView) {
      esriSurfaceView.removeChildView(containerView);
    }
    super.detachContainer(containerView);
  }
}
