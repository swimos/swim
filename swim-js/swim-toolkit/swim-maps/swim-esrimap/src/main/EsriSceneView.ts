// Copyright 2015-2022 Swim.inc
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

import {Class, Equivalent, AnyTiming, Timing} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {AnyGeoPerspective, GeoViewport} from "@swim/map";
import {EsriView} from "./EsriView";
import {EsriSceneViewport} from "./EsriSceneViewport";
import type {EsriSceneViewObserver} from "./EsriSceneViewObserver";

/** @public */
export class EsriSceneView extends EsriView {
  constructor(map: __esri.SceneView) {
    super();
    this.map = map;
    this.onMapRender = this.onMapRender.bind(this);
    this.initMap(map);
  }

  override readonly observerType?: Class<EsriSceneViewObserver>;

  override readonly map!: __esri.SceneView;

  protected initMap(map: __esri.SceneView): void {
    map.watch("extent", this.onMapRender);
  }

  @Property<EsriSceneView["geoViewport"]>({
    extends: true,
    initValue(): GeoViewport {
      return EsriSceneViewport.create(this.owner.map);
    },
    willSetValue(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("viewWillSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
    didSetValue(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("viewDidSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
      const immediate = !this.owner.hidden && !this.owner.culled;
      this.owner.requireUpdate(View.NeedsProject, immediate);
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        this.setValue(EsriSceneViewport.create(this.owner.map), Affinity.Intrinsic);
      }
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport> & EsriView["geoViewport"] & {
    /** @internal */
    update(): void;
  };

  protected onMapRender(): void {
    this.geoViewport.update();
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    const target: __esri.GoToTarget3D = {};
    const options: __esri.GoToOptions3D = {};
    const geoViewport = this.geoViewport.value;
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

  @ViewRef<EsriSceneView["canvas"]>({
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
  override readonly canvas!: ViewRef<this, CanvasView> & EsriView["canvas"];
  static override readonly canvas: FastenerClass<EsriSceneView["canvas"]>;

  @ViewRef<EsriSceneView["container"]>({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      const esriContainerView = HtmlView.fromNode(this.owner.map.container);
      const esriRootView = HtmlView.fromNode(esriContainerView.node.querySelector(".esri-view-root") as HTMLDivElement);
      const esriOverlayView = HtmlView.fromNode(esriRootView.node.querySelector(".esri-view-surface") as HTMLDivElement);
      this.owner.canvas.insertView(esriOverlayView);
      EsriView.container.prototype.didAttachView.call(this, containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      EsriView.container.prototype.willDetachView.call(this, containerView);
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
  static override readonly container: FastenerClass<EsriSceneView["container"]>;
}
