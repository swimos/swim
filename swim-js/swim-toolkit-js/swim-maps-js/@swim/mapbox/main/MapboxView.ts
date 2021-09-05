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

import {Equivalent} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import {AnyGeoPerspective, MapView} from "@swim/map";
import {MapboxViewport} from "./MapboxViewport";
import type {MapboxViewObserver} from "./MapboxViewObserver";

export class MapboxView extends MapView {
  constructor(map: mapboxgl.Map) {
    super();
    Object.defineProperty(this, "map", {
      value: map,
      enumerable: true,
    });
    Object.defineProperty(this, "geoViewport", {
      value: MapboxViewport.create(map),
      enumerable: true,
      configurable: true,
    });
    this.onMapRender = this.onMapRender.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.initMap(map);
  }

  override readonly viewObservers!: ReadonlyArray<MapboxViewObserver>;

  readonly map!: mapboxgl.Map;

  protected initMap(map: mapboxgl.Map): void {
    map.on("render", this.onMapRender);
    map.on("movestart", this.onMoveStart);
    map.on("moveend", this.onMoveEnd);
  }

  override readonly geoViewport!: MapboxViewport;

  protected willSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGeoViewport !== void 0) {
        viewObserver.viewWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected onSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport): void {
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
    const newGeoViewport = MapboxViewport.create(this.map);
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
      canvasView.setEventNode(this.map.getCanvasContainer());
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
    HtmlView.fromNode(this.map.getContainer());
    HtmlView.fromNode(this.map.getCanvasContainer());
  }

  protected override attachContainer(containerView: HtmlView): void {
    super.attachContainer(containerView);
    const canvasContainerView = HtmlView.fromNode(this.map.getCanvasContainer());
    this.canvas.injectView(canvasContainerView);
  }

  protected override detachContainer(containerView: HtmlView): void {
    const canvasView = this.canvas.view;
    const canvasContainerView = HtmlView.fromNode(this.map.getCanvasContainer());
    if (canvasView !== null && canvasView.parentView === canvasContainerView) {
      canvasContainerView.removeChildView(containerView);
    }
    super.detachContainer(containerView);
  }
}
