// Copyright 2015-2023 Swim.inc
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

import type {Class, AnyTiming} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {R2Box} from "@swim/math";
import {ViewFlags, View, ViewRef} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {AnyGeoPerspective} from "../geo/GeoPerspective";
import type {GeoViewport} from "../geo/GeoViewport";
import {MapView} from "../map/MapView";
import {WorldMapViewport} from "./WorldMapViewport";
import {EquirectangularMapViewport} from "./EquirectangularMapViewport";
import type {WorldMapViewObserver} from "./WorldMapViewObserver";

/** @public */
export class WorldMapView extends MapView {
  constructor(geoViewport: WorldMapViewport) {
    super();
    this.geoViewport.setValue(geoViewport, Affinity.Intrinsic);
  }

  override readonly observerType?: Class<WorldMapViewObserver>;

  @Property<WorldMapView["geoViewport"]>({
    extends: true,
    willSetValue(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("viewWillSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
    didSetValue(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("viewDidSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic) && this.value instanceof WorldMapViewport) {
        this.setValue(this.value.withViewFrame(this.owner.viewFrame), Affinity.Intrinsic);
      }
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport> & MapView["geoViewport"] & {
    /** @internal */
    update(): void;
  };

  protected override willProcess(processFlags: ViewFlags): void {
    if ((processFlags & View.NeedsProject) !== 0) {
      this.geoViewport.update();
    }
    super.willProcess(processFlags);
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    // nop
  }

  @ViewRef<WorldMapView["canvas"]>({
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
  override readonly canvas!: ViewRef<this, CanvasView> & MapView["canvas"];
  static override readonly canvas: FastenerClass<WorldMapView["canvas"]>;

  @ViewRef<WorldMapView["container"]>({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      this.owner.canvas.insertView(containerView);
      MapView.container.prototype.didAttachView.call(this, containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      MapView.container.prototype.willDetachView.call(this, containerView);
      const canvasView = this.owner.canvas.view;
      if (canvasView !== null && canvasView.parent === containerView) {
        containerView.removeChild(canvasView);
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView> & MapView["container"];
  static override readonly container: FastenerClass<WorldMapView["container"]>;

  static override create(geoViewport?: WorldMapViewport): WorldMapView;
  static override create(): WorldMapView;
  static override create(geoViewport?: WorldMapViewport): WorldMapView {
    if (geoViewport === void 0) {
      geoViewport = new EquirectangularMapViewport(R2Box.undefined());
    }
    return new WorldMapView(geoViewport);
  }
}
