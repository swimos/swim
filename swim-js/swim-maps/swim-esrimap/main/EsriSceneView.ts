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
import {Equivalent} from "@swim/util";
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
import type {EsriViewObserver} from "./EsriView";
import {EsriView} from "./EsriView";
import {EsriSceneViewport} from "./EsriSceneViewport";

/** @public */
export interface EsriSceneViewObserver<V extends EsriSceneView = EsriSceneView> extends EsriViewObserver<V> {
}

/** @public */
export class EsriSceneView extends EsriView {
  constructor(map: __esri.SceneView) {
    super();
    this.map = map;
    (this.geoViewport as Mutable<typeof this.geoViewport>).value = EsriSceneViewport.create(map);

    this.onMapRender = this.onMapRender.bind(this);
    this.initMap(map);
  }

  declare readonly observerType?: Class<EsriSceneViewObserver>;

  override readonly map!: __esri.SceneView;

  protected initMap(map: __esri.SceneView): void {
    map.watch("extent", this.onMapRender);
  }

  @Property({
    extends: true,
    didSetValue(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null): void {
      super.didSetValue(newGeoViewport, oldGeoViewport);
      const immediate = !this.owner.hidden && !this.owner.culled;
      this.owner.requireUpdate(View.NeedsProject, immediate);
    },
    update(): void {
      if (!this.hasAffinity(Affinity.Intrinsic)) {
        return;
      }
      this.setIntrinsic(EsriSceneViewport.create(this.owner.map));
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport | null> & EsriView["geoViewport"] & {
    /** @internal */
    update(): void;
  };

  protected onMapRender(): void {
    this.geoViewport.update();
  }

  override moveTo(geoPerspective: GeoPerspectiveLike, timing?: TimingLike | boolean): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }

    geoPerspective = GeoPerspective.fromLike(geoPerspective);
    const target: __esri.GoToTarget3D = {};
    const options: __esri.GoToOptions3D = {};

    const geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== null && !geoViewport.geoCenter.equivalentTo(geoCenter, 1e-5)) {
      target.center = [geoCenter.lng, geoCenter.lat];
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
      timing = Timing.fromLike(timing);
    }
    if (timing instanceof Timing) {
      options.duration = timing.duration;
    } else {
      options.duration = 0;
    }

    this.map.goTo(target, options);
  }

  @ViewRef({
    extends: true,
    didAttachView(canvasView: CanvasView, targetView: View | null): void {
      if (this.owner.parent === null) {
        canvasView.appendChild(this.owner);
        canvasView.setEventTarget(this.owner.map.container.querySelector(".esri-view-root") as HTMLElement);
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
  override readonly canvas!: ViewRef<this, CanvasView> & EsriView["canvas"];

  @ViewRef({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      const esriContainerView = HtmlView.fromNode(this.owner.map.container);
      const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
      const esriOverlayView = HtmlView.fromNode(esriRootView.node.querySelector(".esri-view-surface") as HTMLDivElement);
      this.owner.canvas.insertView(esriOverlayView);
      super.didAttachView(containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      super.willDetachView(containerView);
      const canvasView = this.owner.canvas.view;
      const esriContainerView = HtmlView.fromNode(this.owner.map.container);
      const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
      const esriSurfaceView = HtmlView.fromNode(esriRootView.node.querySelector(".esri-view-surface") as HTMLDivElement);
      if (canvasView !== null && canvasView.parent === esriSurfaceView) {
        esriSurfaceView.removeChild(containerView);
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView> & EsriView["container"];
}
