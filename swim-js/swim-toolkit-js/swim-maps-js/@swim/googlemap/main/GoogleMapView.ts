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

/// <reference types="google.maps"/>

import {Mutable, Class, Lazy, Equivalent, AnyTiming} from "@swim/util";
import {GeoPoint} from "@swim/geo";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {ViewHtml, HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import {AnyGeoPerspective, MapView} from "@swim/map";
import {GoogleMapViewport} from "./GoogleMapViewport";
import type {GoogleMapViewObserver} from "./GoogleMapViewObserver";

export class GoogleMapView extends MapView {
  constructor(map: google.maps.Map) {
    super();
    this.map = map;
    this.mapOverlay = this.createMapOverlay(map);
    Object.defineProperty(this, "geoViewport", {
      value: GoogleMapViewport.create(this.map, this.mapOverlay.getProjection()),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.onMapDraw = this.onMapDraw.bind(this);
    this.onMapIdle = this.onMapIdle.bind(this);
    this.initMap(map);
  }

  override readonly observerType?: Class<GoogleMapViewObserver>;

  readonly map: google.maps.Map;

  protected initMap(map: google.maps.Map): void {
    map.addListener("idle", this.onMapIdle);
  }

  readonly mapOverlay: google.maps.OverlayView;

  protected createMapOverlay(map: google.maps.Map): google.maps.OverlayView {
    const mapOverlay = new GoogleMapView.MapOverlay(this);
    mapOverlay.setMap(map);
    return mapOverlay;
  }

  /** @internal */
  @Lazy
  static get MapOverlay(): {new(owner: GoogleMapView): google.maps.OverlayView} {
    return class GoogleMapOverlayView extends google.maps.OverlayView {
      constructor(owner: GoogleMapView) {
        super();
        this.owner = owner;
      }
      readonly owner: GoogleMapView;
      override onAdd(): void {
        const containerView = this.owner.container.view;
        if (containerView !== null) {
          this.owner.initContainer(containerView);
          this.owner.attachContainer(containerView);
        }
      }
      override onRemove(): void {
        this.owner.canvas.removeView();
      }
      override draw(): void {
        this.owner.onMapDraw();
      }
    }
  }

  override readonly geoViewport!: GoogleMapViewport;

  protected willSetGeoViewport(newGeoViewport: GoogleMapViewport, oldGeoViewport: GoogleMapViewport): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetGeoViewport !== void 0) {
        observer.viewWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected onSetGeoViewport(newGeoViewport: GoogleMapViewport, oldGeoViewport: GoogleMapViewport): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: GoogleMapViewport, oldGeoViewport: GoogleMapViewport): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!
      if (observer.viewDidSetGeoViewport !== void 0) {
        observer.viewDidSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected updateGeoViewport(): boolean {
    const oldGeoViewport = this.geoViewport;
    const newGeoViewport = GoogleMapViewport.create(this.map, this.mapOverlay.getProjection());
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
    if ((this.flags & View.NeedsProject) !== 0 && this.updateGeoViewport()) {
      (viewContext as Mutable<ViewContextType<this>>).geoViewport = this.geoViewport;
    }
    super.willProcess(processFlags, viewContext);
  }

  protected onMapDraw(): void {
    if (this.updateGeoViewport()) {
      const immediate = !this.isHidden() && !this.culled;
      this.requireUpdate(View.NeedsProject, immediate);
    }
  }

  protected onMapIdle(): void {
    this.requireUpdate(View.NeedsProject);
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    const geoViewport = this.geoViewport;
    let geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== void 0 && geoCenter !== null) {
      geoCenter = GeoPoint.fromAny(geoCenter);
      if (!geoViewport.geoCenter.equivalentTo(geoCenter, 1e-5)) {
        this.map.panTo(geoCenter);
      }
    }
    const zoom = geoPerspective.zoom;
    if (zoom !== void 0 && !Equivalent(geoViewport.zoom, zoom, 1e-5)) {
      this.map.setZoom(zoom);
    }
    const heading = geoPerspective.heading;
    if (heading !== void 0 && !Equivalent(geoViewport.heading, heading, 1e-5)) {
      this.map.setHeading(heading);
    }
    const tilt = geoPerspective.tilt;
    if (tilt !== void 0 && !Equivalent(geoViewport.tilt, tilt, 1e-5)) {
      this.map.setTilt(tilt);
    }
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

  protected override initContainer(containerView: HtmlView): void {
    super.initContainer(containerView);
    const mapPanes = this.mapOverlay.getPanes();
    if (mapPanes !== void 0 && mapPanes !== null) {
      materializeAncestors(mapPanes.overlayMouseTarget as HTMLElement);
    }
    function materializeAncestors(node: HTMLElement): HtmlView {
      const parentNode = node.parentNode;
      if (parentNode instanceof HTMLElement && (parentNode as ViewHtml).view === void 0) {
        materializeAncestors(parentNode);
      }
      return HtmlView.fromNode(node);
    }
  }

  protected override attachContainer(containerView: HtmlView): void {
    super.attachContainer(containerView);
    const mapPanes = this.mapOverlay.getPanes();
    if (mapPanes !== void 0 && mapPanes !== null) {
      const overlayMouseTargetView = (mapPanes.overlayMouseTarget as ViewHtml).view!;
      const overlayContainerView = overlayMouseTargetView.parent as HtmlView;
      const canvasContainerView = overlayContainerView.parent as HtmlView;
      this.canvas.injectView(canvasContainerView);
    } else if (this.canvas.view === null) {
      this.canvas.setView(this.canvas.createView());
    }
  }

  protected override detachContainer(containerView: HtmlView): void {
    const canvasView = this.canvas.view;
    const mapPanes = this.mapOverlay.getPanes();
    if (mapPanes !== void 0 && mapPanes !== null) {
      const overlayMouseTargetView = (mapPanes.overlayMouseTarget as ViewHtml).view!;
      const overlayContainerView = overlayMouseTargetView.parent as HtmlView;
      const canvasContainerView = overlayContainerView.parent as HtmlView;
      if (canvasView !== null && canvasView.parent === canvasContainerView) {
        canvasContainerView.removeChild(containerView);
      }
    }
    super.detachContainer(containerView);
  }
}
