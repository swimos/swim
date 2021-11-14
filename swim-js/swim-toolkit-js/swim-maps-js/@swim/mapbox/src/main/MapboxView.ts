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

/// <reference types="mapbox-gl"/>

import {Mutable, Class, Equivalent, AnyTiming, Timing} from "@swim/util";
import type {MemberFastenerClass} from "@swim/fastener";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import {AnyGeoPerspective, MapView} from "@swim/map";
import {MapboxViewport} from "./MapboxViewport";
import type {MapboxViewObserver} from "./MapboxViewObserver";

/** @public */
export class MapboxView extends MapView {
  constructor(map: mapboxgl.Map) {
    super();
    this.map = map;
    Object.defineProperty(this, "geoViewport", {
      value: MapboxViewport.create(map),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.onMapRender = this.onMapRender.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.initMap(map);
  }

  override readonly observerType?: Class<MapboxViewObserver>;

  readonly map: mapboxgl.Map;

  protected initMap(map: mapboxgl.Map): void {
    map.on("render", this.onMapRender);
    map.on("movestart", this.onMoveStart);
    map.on("moveend", this.onMoveEnd);
  }

  override readonly geoViewport!: MapboxViewport;

  protected willSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport): void {
    this.callObservers("viewWillSetGeoViewport", newGeoViewport, oldGeoViewport, this);
  }

  protected onSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport): void {
    this.callObservers("viewDidSetGeoViewport", newGeoViewport, oldGeoViewport, this);
  }

  protected updateGeoViewport(): boolean {
    const oldGeoViewport = this.geoViewport;
    const newGeoViewport = MapboxViewport.create(this.map);
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
      const immediate = !this.isHidden() && !this.culled;
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
    const options: mapboxgl.FlyToOptions = {};
    const geoViewport = this.geoViewport;
    let geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== void 0 && geoCenter !== null) {
      geoCenter = GeoPoint.fromAny(geoCenter);
      if (!geoViewport.geoCenter.equivalentTo(geoCenter, 1e-5)) {
        options.center = geoCenter;
      }
    }
    const zoom = geoPerspective.zoom;
    if (zoom !== void 0 && !Equivalent(geoViewport.zoom, zoom, 1e-5)) {
      options.zoom = zoom;
    }
    const heading = geoPerspective.heading;
    if (heading !== void 0 && !Equivalent(geoViewport.heading, heading, 1e-5)) {
      options.bearing = heading;
    }
    const tilt = geoPerspective.tilt;
    if (tilt !== void 0 && !Equivalent(geoViewport.tilt, tilt, 1e-5)) {
      options.pitch = tilt;
    }
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    if (timing instanceof Timing) {
      options.duration = timing.duration;
    }
    this.map.flyTo(options);
  }

  protected willMoveMap(): void {
    this.callObservers("viewWillMoveMap", this);
  }

  protected didMoveMap(): void {
    this.callObservers("viewDidMoveMap", this);
  }

  @ViewRef<MapboxView, CanvasView>({
    extends: true,
    didAttachView(canvasView: CanvasView, targetView: View | null): void {
      if (this.owner.parent === null) {
        canvasView.appendChild(this.owner);
        canvasView.setEventNode(this.owner.map.getCanvasContainer());
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
  static override readonly canvas: MemberFastenerClass<MapboxView, "canvas">;

  @ViewRef<MapboxView, HtmlView>({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      HtmlView.fromNode(this.owner.map.getContainer());
      const canvasContainerView =  HtmlView.fromNode(this.owner.map.getCanvasContainer());
      this.owner.canvas.insertView(canvasContainerView);
      MapView.container.prototype.didAttachView.call(this, containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      MapView.container.prototype.willDetachView.call(this, containerView);
      const canvasView = this.owner.canvas.view;
      const canvasContainerView = HtmlView.fromNode(this.owner.map.getCanvasContainer());
      if (canvasView !== null && canvasView.parent === canvasContainerView) {
        canvasContainerView.removeChild(containerView);
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView>;
  static override readonly container: MemberFastenerClass<MapboxView, "container">;
}
