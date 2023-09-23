// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {R2Box} from "@swim/math";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {GeoPerspectiveLike} from "./GeoPerspective";
import type {GeoViewport} from "./GeoViewport";
import type {MapViewObserver} from "./MapView";
import {MapView} from "./MapView";
import {WorldMapViewport} from "./WorldMapViewport";
import {EquirectangularMapViewport} from "./WorldMapViewport";

/** @public */
export interface WorldMapViewObserver<V extends WorldMapView = WorldMapView> extends MapViewObserver<V> {
  viewWillSetGeoViewport?(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null, view: V): void;

  viewDidSetGeoViewport?(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null, view: V): void;
}

/** @public */
export class WorldMapView extends MapView {
  constructor(geoViewport: WorldMapViewport) {
    super();
    (this.geoViewport as Mutable<typeof this.geoViewport>).value = geoViewport;
  }

  declare readonly observerType?: Class<WorldMapViewObserver>;

  @Property({
    extends: true,
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic) && this.value instanceof WorldMapViewport) {
        this.setIntrinsic(this.value.withViewFrame(this.owner.viewFrame));
      }
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport | null> & MapView["geoViewport"] & {
    /** @internal */
    update(): void;
  };

  protected override willProcess(processFlags: ViewFlags): void {
    if ((processFlags & View.NeedsProject) !== 0) {
      this.geoViewport.update();
    }
    super.willProcess(processFlags);
  }

  override moveTo(geoPerspective: GeoPerspectiveLike, timing?: TimingLike | boolean): void {
    // nop
  }

  @ViewRef({
    extends: true,
    didAttachView(canvasView: CanvasView, targetView: View | null): void {
      if (this.owner.parent === null) {
        canvasView.appendChild(this.owner);
      }
      super.didAttachView(canvasView, targetView);
    },
    willDetachView(canvasView: CanvasView): void {
      super.willDetachView(canvasView);
      if (this.owner.parent === canvasView) {
        canvasView.removeChild(this.owner);
      }
    },
  })
  override readonly canvas!: ViewRef<this, CanvasView> & MapView["canvas"];

  @ViewRef({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      this.owner.canvas.insertView(containerView);
      super.didAttachView(containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      super.willDetachView(containerView);
      const canvasView = this.owner.canvas.view;
      if (canvasView !== null && canvasView.parent === containerView) {
        containerView.removeChild(canvasView);
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView> & MapView["container"];

  static override create(geoViewport?: WorldMapViewport): WorldMapView;
  static override create(): WorldMapView;
  static override create(geoViewport?: WorldMapViewport): WorldMapView {
    if (geoViewport === void 0) {
      geoViewport = new EquirectangularMapViewport(R2Box.undefined());
    }
    return new WorldMapView(geoViewport);
  }
}
