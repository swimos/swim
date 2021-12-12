// Copyright 2015-2021 Swim.inc
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

import {Mutable, Class, AnyTiming, Timing} from "@swim/util";
import {Affinity, MemberFastenerClass} from "@swim/component";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import {AnyGeoPerspective, MapView} from "@swim/map";
import {LeafletViewport} from "./LeafletViewport";
import type {LeafletViewObserver} from "./LeafletViewObserver";

/** @public */
export class LeafletView extends MapView {
  constructor(map: L.Map) {
    super();
    this.map = map;
    Object.defineProperty(this, "geoViewport", {
      value: LeafletViewport.create(map),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.onMapRender = this.onMapRender.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.initMap(map);
  }

  override readonly observerType?: Class<LeafletViewObserver>;

  readonly map: L.Map;

  protected initMap(map: L.Map): void {
    map.on("move", this.onMapRender);
    map.on("movestart", this.onMoveStart);
    map.on("moveend", this.onMoveEnd);
  }

  override readonly geoViewport!: LeafletViewport;

  protected willSetGeoViewport(newGeoViewport: LeafletViewport, oldGeoViewport: LeafletViewport): void {
    this.callObservers("viewWillSetGeoViewport", newGeoViewport, oldGeoViewport, this);
  }

  protected onSetGeoViewport(newGeoViewport: LeafletViewport, oldGeoViewport: LeafletViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: LeafletViewport, oldGeoViewport: LeafletViewport): void {
    this.callObservers("viewDidSetGeoViewport", newGeoViewport, oldGeoViewport, this);
  }

  protected updateGeoViewport(): boolean {
    const oldGeoViewport = this.geoViewport;
    const newGeoViewport = LeafletViewport.create(this.map);
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
      const immediate = !this.hidden && !this.culled;
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
    this.callObservers("viewWillMoveMap", this);
  }

  protected didMoveMap(): void {
    this.callObservers("viewDidMoveMap", this);
  }

  @ViewRef<LeafletView, CanvasView>({
    extends: true,
    didAttachView(canvasView: CanvasView, targetView: View | null): void {
      if (this.owner.parent === null) {
        canvasView.appendChild(this.owner);
      }
      MapView.canvas.prototype.didAttachView.call(this, canvasView, targetView);
    },
    willDetachView(canvasView: CanvasView): void {
      MapView.canvas.prototype.willDetachView.call(this, canvasView);
      if (this.owner.parent === canvasView) {
        canvasView.removeChild(this.owner);
      }
    },
  })
  override readonly canvas!: ViewRef<this, CanvasView>;
  static override readonly canvas: MemberFastenerClass<LeafletView, "canvas">;

  @ViewRef<LeafletView, HtmlView>({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      const controlContainerView = HtmlView.fromNode(containerView.node.querySelector(".leaflet-control-container") as HTMLDivElement);
      const canvasView = this.owner.canvas.insertView(containerView, void 0, controlContainerView);
      if (canvasView !== null) {
        canvasView.zIndex.setState(500, Affinity.Intrinsic);
      }
      MapView.container.prototype.didAttachView.call(this, containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      MapView.container.prototype.willDetachView.call(this, containerView);
      const canvasView = this.owner.canvas.view;
      if (canvasView !== null && canvasView.parent === containerView) {
        containerView.removeChild(containerView);
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView>;
  static override readonly container: MemberFastenerClass<LeafletView, "container">;
}
