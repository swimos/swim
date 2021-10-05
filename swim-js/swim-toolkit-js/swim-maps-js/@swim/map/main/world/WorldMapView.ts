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

import type {Mutable, Class, AnyTiming} from "@swim/util";
import {R2Box} from "@swim/math";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {AnyGeoPerspective} from "../geo/GeoPerspective";
import {MapView} from "../map/MapView";
import type {WorldMapViewport} from "./WorldMapViewport";
import {EquirectangularMapViewport} from "./EquirectangularMapViewport";
import type {WorldMapViewObserver} from "./WorldMapViewObserver";

export class WorldMapView extends MapView {
  constructor(geoViewport: WorldMapViewport) {
    super();
    Object.defineProperty(this, "geoViewport", {
      value: geoViewport,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly observerType?: Class<WorldMapViewObserver>;

  override readonly geoViewport!: WorldMapViewport;

  protected willSetGeoViewport(newGeoViewport: WorldMapViewport, oldGeoViewport: WorldMapViewport): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetGeoViewport !== void 0) {
        observer.viewWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected onSetGeoViewport(newGeoViewport: WorldMapViewport, oldGeoViewport: WorldMapViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: WorldMapViewport, oldGeoViewport: WorldMapViewport): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetGeoViewport !== void 0) {
        observer.viewDidSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected updateGeoViewport(): boolean {
    const oldGeoViewport = this.geoViewport;
    const newGeoViewport = oldGeoViewport.withViewFrame(this.viewFrame);
    if (!newGeoViewport.equals(oldGeoViewport)) {
      this.willSetGeoViewport(newGeoViewport, oldGeoViewport);
      (this as Mutable<this>).geoViewport = newGeoViewport;
      this.onSetGeoViewport(newGeoViewport, oldGeoViewport);
      this.didSetGeoViewport(newGeoViewport, oldGeoViewport);
      return true;
    }
    return false;
  }

  protected override willProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((processFlags & View.NeedsProject) !== 0) {
      this.updateGeoViewport();
      (viewContext as Mutable<ViewContextType<this>>).geoViewport = this.geoViewport;
    }
    super.willProcess(processFlags, viewContext);
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    // nop
  }

  protected override attachCanvas(canvasView: CanvasView): void {
    super.attachCanvas(canvasView);
    if (this.parent === null) {
      canvasView.appendChild(this);
    }
  }

  protected override detachCanvas(canvasView: CanvasView): void {
    if (this.parent === canvasView) {
      canvasView.removeChild(this);
    }
    super.detachCanvas(canvasView);
  }

  protected override attachContainer(containerView: HtmlView): void {
    super.attachContainer(containerView);
    this.canvas.injectView(containerView);
  }

  protected override detachContainer(containerView: HtmlView): void {
    const canvasView = this.canvas.view;
    if (canvasView !== null && canvasView.parent === containerView) {
      containerView.removeChild(containerView);
    }
    super.detachContainer(containerView);
  }

  static override create(geoViewport?: WorldMapViewport): WorldMapView;
  static override create(): WorldMapView;
  static override create(geoViewport?: WorldMapViewport): WorldMapView {
    if (geoViewport === void 0) {
      geoViewport = new EquirectangularMapViewport(R2Box.undefined());
    }
    return new WorldMapView(geoViewport);
  }
}
