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

/// <reference types="leaflet"/>

import {AnyTiming, Timing} from "@swim/mapping";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import {AnyGeoPerspective, MapView} from "@swim/map";
import {LeafletViewport} from "./LeafletViewport";
import type {LeafletViewObserver} from "./LeafletViewObserver";

export class LeafletView extends MapView {
  constructor(map: L.Map) {
    super();
    Object.defineProperty(this, "map", {
      value: map,
      enumerable: true,
    });
    Object.defineProperty(this, "geoViewport", {
      value: LeafletViewport.create(map),
      enumerable: true,
      configurable: true,
    });
    this.onMapRender = this.onMapRender.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.initMap(map);
  }

  override readonly viewObservers!: ReadonlyArray<LeafletViewObserver>;

  readonly map!: L.Map;

  protected initMap(map: L.Map): void {
    map.on("move", this.onMapRender);
    map.on("movestart", this.onMoveStart);
    map.on("moveend", this.onMoveEnd);
  }

  override readonly geoViewport!: LeafletViewport;

  protected willSetGeoViewport(newGeoViewport: LeafletViewport, oldGeoViewport: LeafletViewport): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGeoViewport !== void 0) {
        viewObserver.viewWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected onSetGeoViewport(newGeoViewport: LeafletViewport, oldGeoViewport: LeafletViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: LeafletViewport, oldGeoViewport: LeafletViewport): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!
      if (viewObserver.viewDidSetGeoViewport !== void 0) {
        viewObserver.viewDidSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected updateGeoViewport(): boolean {
    const oldGeoViewport = this.geoViewport;
    const newGeoViewport = LeafletViewport.create(this.map);
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

  protected onMoveStart(): void {
    this.willMoveMap();
  }

  protected onMoveEnd(): void {
    this.didMoveMap();
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    const options: L.ZoomPanOptions = {};
    const geoViewport = this.geoViewport;
    let geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== void 0 && geoCenter !== null) {
      geoCenter = GeoPoint.fromAny(geoCenter);
    } else {
      geoCenter = geoViewport.geoCenter;
    }
    const zoom = geoPerspective.zoom;
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    if (timing instanceof Timing) {
      options.animate = true;
      options.duration = timing.duration;
    }
    this.map.flyTo(geoCenter, zoom, options);
  }

  protected willMoveMap(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillMoveMap !== void 0) {
        viewObserver.viewWillMoveMap(this);
      }
    }
  }

  protected didMoveMap(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!
      if (viewObserver.viewDidMoveMap !== void 0) {
        viewObserver.viewDidMoveMap(this);
      }
    }
  }

  protected override attachCanvas(canvasView: CanvasView): void {
    super.attachCanvas(canvasView);
    if (this.parentView === null) {
      canvasView.appendChildView(this);
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
    HtmlView.fromNode(containerView.node.querySelector(".leaflet-control-container") as HTMLDivElement);
  }

  protected override attachContainer(containerView: HtmlView): void {
    super.attachContainer(containerView);
    const controlContainerView = HtmlView.fromNode(containerView.node.querySelector(".leaflet-control-container") as HTMLDivElement);
    const canvasView = this.canvas.injectView(containerView, void 0, controlContainerView);
    if (canvasView !== null) {
      canvasView.zIndex.setState(500, View.Intrinsic);
    }
  }

  protected override detachContainer(containerView: HtmlView): void {
    const canvasView = this.canvas.view;
    if (canvasView !== null && canvasView.parentView === containerView) {
      containerView.removeChildView(containerView);
    }
    super.detachContainer(containerView);
  }
}
