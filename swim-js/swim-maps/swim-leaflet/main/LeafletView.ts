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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {GeoPerspectiveLike} from "@swim/map";
import {GeoPerspective} from "@swim/map";
import type {GeoViewport} from "@swim/map";
import type {MapViewObserver} from "@swim/map";
import {MapView} from "@swim/map";
import {LeafletViewport} from "./LeafletViewport";

/** @public */
export interface LeafletViewObserver<V extends LeafletView = LeafletView> extends MapViewObserver<V> {
  viewWillMoveMap?(view: V): void;

  viewDidMoveMap?(view: V): void;
}

/** @public */
export class LeafletView extends MapView {
  constructor(map: L.Map) {
    super();
    this.map = map;
    (this.geoViewport as Mutable<typeof this.geoViewport>).value = LeafletViewport.create(map);

    this.onMapRender = this.onMapRender.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.initMap(map);
  }

  declare readonly observerType?: Class<LeafletViewObserver>;

  readonly map: L.Map;

  protected initMap(map: L.Map): void {
    map.on("move", this.onMapRender);
    map.on("movestart", this.onMoveStart);
    map.on("moveend", this.onMoveEnd);
  }

  @Property({
    extends: true,
    didSetValue(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null): void {
      super.didSetValue(newGeoViewport, oldGeoViewport);
      const immediate = !this.owner.hidden && !this.owner.culled;
      this.owner.requireUpdate(View.NeedsProject, immediate);
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        this.setIntrinsic(LeafletViewport.create(this.owner.map));
      }
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport | null> & MapView["geoViewport"] & {
    /** @internal */
    update(): void;
  };

  protected onMapRender(): void {
    this.geoViewport.update();
  }

  protected onMoveStart(): void {
    this.willMoveMap();
  }

  protected onMoveEnd(): void {
    this.didMoveMap();
  }

  override moveTo(geoPerspective: GeoPerspectiveLike, timing?: TimingLike | boolean): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }

    geoPerspective = GeoPerspective.fromLike(geoPerspective);
    const options: L.ZoomPanOptions = {};

    let geoCenter = geoPerspective.geoCenter;
    if (geoCenter === null) {
      geoCenter = geoViewport.geoCenter;
    }

    const zoom = geoPerspective.zoom;

    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    if (timing instanceof Timing) {
      options.animate = true;
      options.duration = timing.duration;
    } else {
      options.duration = 0;
    }

    this.map.flyTo(geoCenter, zoom, options);
  }

  protected willMoveMap(): void {
    this.callObservers("viewWillMoveMap", this);
  }

  protected didMoveMap(): void {
    this.callObservers("viewDidMoveMap", this);
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
      const controlContainerView = HtmlView.fromNode(containerView.node.querySelector(".leaflet-control-container") as HTMLDivElement);
      const canvasView = this.owner.canvas.insertView(containerView, void 0, controlContainerView);
      if (canvasView !== null) {
        canvasView.style.zIndex.setIntrinsic(500);
      }
      super.didAttachView(containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      super.willDetachView(containerView);
      const canvasView = this.owner.canvas.view;
      if (canvasView !== null && canvasView.parent === containerView) {
        containerView.removeChild(containerView);
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView> & MapView["container"];
}
