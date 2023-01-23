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

import {Class, Lazy, Equivalent, AnyTiming} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {GeoPoint} from "@swim/geo";
import {ViewFlags, View, ViewRef} from "@swim/view";
import {ViewHtml, HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import {GeoViewport, AnyGeoPerspective, MapView} from "@swim/map";
import {GoogleMapViewport} from "./GoogleMapViewport";
import type {GoogleMapViewObserver} from "./GoogleMapViewObserver";

/** @public */
export class GoogleMapView extends MapView {
  constructor(map: google.maps.Map) {
    super();
    this.map = map;
    this.mapOverlay = this.createMapOverlay(map);
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
          this.owner.container.materializeView(containerView);
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

  @Property<GoogleMapView["geoViewport"]>({
    extends: true,
    initValue(): GeoViewport {
      return GoogleMapViewport.create(this.owner.map, this.owner.mapOverlay.getProjection());
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
        this.setValue(GoogleMapViewport.create(this.owner.map, this.owner.mapOverlay.getProjection()), Affinity.Intrinsic);
      }
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport> & MapView["geoViewport"] & {
    /** @internal */
    update(): void;
  };

  protected override willProcess(processFlags: ViewFlags): void {
    this.geoViewport.update();
    super.willProcess(processFlags);
  }

  protected onMapDraw(): void {
    this.geoViewport.update();
  }

  protected onMapIdle(): void {
    this.requireUpdate(View.NeedsProject);
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    const geoViewport = this.geoViewport.value;
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

  @ViewRef<GoogleMapView["canvas"]>({
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
  static override readonly canvas: FastenerClass<GoogleMapView["canvas"]>;

  @ViewRef<GoogleMapView["container"]>({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      this.materializeView(containerView);
      MapView.container.prototype.didAttachView.call(this, containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      MapView.container.prototype.willDetachView.call(this, containerView);
      const canvasView = this.owner.canvas.view;
      const mapPanes = this.owner.mapOverlay.getPanes();
      if (mapPanes !== void 0 && mapPanes !== null) {
        const overlayMouseTargetView = (mapPanes.overlayMouseTarget as ViewHtml).view!;
        const overlayContainerView = overlayMouseTargetView.parent as HtmlView;
        const canvasContainerView = overlayContainerView.parent as HtmlView;
        if (canvasView !== null && canvasView.parent === canvasContainerView) {
          canvasContainerView.removeChild(containerView);
        }
      }
    },
    materializeView(containerView: HtmlView): void {
      function materializeAncestors(node: HTMLElement): HtmlView {
        const parentNode = node.parentNode;
        if (parentNode instanceof HTMLElement && (parentNode as ViewHtml).view === void 0) {
          materializeAncestors(parentNode);
        }
        return HtmlView.fromNode(node);
      }
      const mapPanes = this.owner.mapOverlay.getPanes();
      if (mapPanes !== void 0 && mapPanes !== null) {
        materializeAncestors(mapPanes.overlayMouseTarget as HTMLElement);
        const overlayMouseTargetView = (mapPanes.overlayMouseTarget as ViewHtml).view!;
        const overlayContainerView = overlayMouseTargetView.parent as HtmlView;
        const canvasContainerView = overlayContainerView.parent as HtmlView;
        this.owner.canvas.insertView(canvasContainerView);
      } else if (this.owner.canvas.view === null) {
        this.owner.canvas.attachView();
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView> & MapView["container"] & {
      materializeView(containerView: HtmlView): void,
    };
  static override readonly container: FastenerClass<GoogleMapView["container"]>;
}
