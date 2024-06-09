// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Property} from "@swim/component";
import {GeoBox} from "@swim/geo";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {CanvasView} from "@swim/graphics";
import type {GeoPerspectiveLike} from "./GeoPerspective";
import type {GeoViewport} from "./GeoViewport";
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";

/** @public */
export interface MapViewObserver<V extends MapView = MapView> extends GeoViewObserver<V> {
  viewWillSetGeoViewport?(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null, view: V): void;

  viewDidSetGeoViewport?(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null, view: V): void;

  viewWillAttachMapCanvas?(mapCanvasView: CanvasView, view: V): void;

  viewDidDetachMapCanvas?(mapCanvasView: CanvasView, view: V): void;

  viewWillAttachMapContainer?(mapContainerView: HtmlView, view: V): void;

  viewDidDetachMapContainer?(mapContainerView: HtmlView, view: V): void;
}

/** @public */
export abstract class MapView extends GeoView {
  declare readonly observerType?: Class<MapViewObserver>;

  @Property({
    extends: true,
    inherits: false,
    willSetValue(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null): void {
      this.owner.callObservers("viewWillSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
    didSetValue(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null): void {
      this.owner.callObservers("viewDidSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport | null> & GeoView["geoViewport"];

  abstract moveTo(geoPerspective: GeoPerspectiveLike, timing?: TimingLike | boolean): void;

  @ViewRef({
    viewType: CanvasView,
    willAttachView(canvasView: CanvasView): void {
      this.owner.callObservers("viewWillAttachMapCanvas", canvasView, this.owner);
    },
    didDetachView(canvasView: CanvasView): void {
      this.owner.callObservers("viewDidDetachMapCanvas", canvasView, this.owner);
    },
  })
  readonly canvas!: ViewRef<this, CanvasView>;

  @ViewRef({
    viewType: HtmlView,
    willAttachView(containerView: HtmlView): void {
      this.owner.callObservers("viewWillAttachMapContainer", containerView, this.owner);
    },
    didDetachView(containerView: HtmlView): void {
      this.owner.callObservers("viewDidDetachMapContainer", containerView, this.owner);
    },
  })
  readonly container!: ViewRef<this, HtmlView>;

  protected override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsProject;
    }
    return processFlags;
  }

  override get geoFrame(): GeoBox {
    const geoViewport = this.geoViewport.value;
    return geoViewport !== null ? geoViewport.geoFrame : GeoBox.globe();
  }
}
