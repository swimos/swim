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
import {Lazy} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {GeoViewport} from "@swim/map";
import type {GeoPerspectiveLike} from "@swim/map";
import {GeoPerspective} from "@swim/map";
import type {MapViewObserver} from "@swim/map";
import {MapView} from "@swim/map";
import {GoogleMapViewport} from "./GoogleMapViewport";

/** @public */
export interface GoogleMapViewObserver<V extends GoogleMapView = GoogleMapView> extends MapViewObserver<V> {
}

/** @public */
export class GoogleMapView extends MapView {
  constructor(map: google.maps.Map) {
    super();
    this.map = map;
    this.mapOverlay = this.createMapOverlay(map);
    (this.geoViewport as Mutable<typeof this.geoViewport>).value =
        GoogleMapViewport.create(map, this.mapOverlay.getProjection());

    this.onMapDraw = this.onMapDraw.bind(this);
    this.onMapIdle = this.onMapIdle.bind(this);
    this.initMap(map);
  }

  declare readonly observerType?: Class<GoogleMapViewObserver>;

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
    };
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
      this.setIntrinsic(GoogleMapViewport.create(this.owner.map, this.owner.mapOverlay.getProjection()));
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport | null> & MapView["geoViewport"] & {
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

  override moveTo(geoPerspective: GeoPerspectiveLike, timing?: TimingLike | boolean): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }

    geoPerspective = GeoPerspective.fromLike(geoPerspective);

    const geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== null && !geoViewport.geoCenter.equivalentTo(geoCenter, 1e-5)) {
      this.map.panTo(geoCenter);
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
      this.materializeView(containerView);
      super.didAttachView(containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      super.willDetachView(containerView);
      const canvasView = this.owner.canvas.view;
      const mapPanes = this.owner.mapOverlay.getPanes();
      if (canvasView === null || mapPanes === void 0 || mapPanes === null) {
        return;
      }
      const overlayMouseTargetView = HtmlView.get(mapPanes.overlayMouseTarget);
      const overlayContainerView = overlayMouseTargetView !== null ? overlayMouseTargetView.parent : null;
      const canvasContainerView = overlayContainerView !== null ? overlayContainerView.parent : null;
      if (canvasContainerView !== null && canvasView.parent === canvasContainerView) {
        canvasContainerView.removeChild(containerView);
      }
    },
    materializeView(containerView: HtmlView): void {
      function materializeAncestors(node: HTMLElement): HtmlView {
        const parentNode = node.parentNode;
        if (parentNode instanceof HTMLElement && HtmlView.get(parentNode) === null) {
          materializeAncestors(parentNode);
        }
        return HtmlView.fromNode(node);
      }
      const mapPanes = this.owner.mapOverlay.getPanes();
      if (mapPanes !== void 0 && mapPanes !== null) {
        materializeAncestors(mapPanes.overlayMouseTarget as HTMLElement);
        const overlayMouseTargetView = HtmlView.get(mapPanes.overlayMouseTarget);
        const overlayContainerView = overlayMouseTargetView !== null ? overlayMouseTargetView.parent : null;
        const canvasContainerView = overlayContainerView !== null ? overlayContainerView.parent : null;
        this.owner.canvas.insertView(canvasContainerView);
      } else if (this.owner.canvas.view === null) {
        this.owner.canvas.attachView();
      }
    },
  })
  override readonly container!: ViewRef<this, HtmlView> & MapView["container"] & {
    materializeView(containerView: HtmlView): void,
  };
}
