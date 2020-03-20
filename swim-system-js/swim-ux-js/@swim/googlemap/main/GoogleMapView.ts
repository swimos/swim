// Copyright 2015-2020 SWIM.AI inc.
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

import {AnyPointR2, PointR2} from "@swim/math";
import {View, RenderedViewContext, ViewHtml, HtmlView, CanvasView} from "@swim/view";
import {AnyLngLat, LngLat, MapViewContext, MapView, MapGraphicsView} from "@swim/map";
import {GoogleMapProjection} from "./GoogleMapProjection";
import {GoogleMapViewObserver} from "./GoogleMapViewObserver";
import {GoogleMapViewController} from "./GoogleMapViewController";

export class GoogleMapView extends MapGraphicsView {
  /** @hidden */
  readonly _map: google.maps.Map;
  /** @hidden */
  _viewController: GoogleMapViewController | null;
  /** @hidden */
  _projection: GoogleMapProjection;
  /** @hidden */
  _overlay: google.maps.OverlayView | null;
  /** @hidden */
  _zoom: number;
  /** @hidden */
  _heading: number;
  /** @hidden */
  _tilt: number;

  constructor(map: google.maps.Map, key: string | null = null) {
    super(key);
    this.onMapRender = this.onMapRender.bind(this);
    this._map = map;
    this._projection = new GoogleMapProjection(this);
    this._overlay = null;
    this._zoom = map.getZoom();
    this._heading = map.getHeading();
    this._tilt = map.getTilt();
    this.initMap(map);
  }

  get map(): google.maps.Map {
    return this._map;
  }

  protected initMap(map: google.maps.Map): void {
    // nop
  }

  get viewController(): GoogleMapViewController | null {
    return this._viewController;
  }

  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    return this._projection.project.apply(this._projection, arguments);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    return this._projection.unproject.apply(this._projection, arguments);
  }

  get projection(): GoogleMapProjection {
    return this._projection;
  }

  setProjection(projection: GoogleMapProjection): void {
    this.willSetProjection(projection);
    this._projection = projection;
    this.onSetProjection(projection);
    this.didSetProjection(projection);
  }

  protected willSetProjection(projection: GoogleMapProjection): void {
    this.willObserve(function (viewObserver: GoogleMapViewObserver): void {
      if (viewObserver.viewWillSetProjection) {
        viewObserver.viewWillSetProjection(projection, this);
      }
    });
  }

  protected onSetProjection(projection: GoogleMapProjection): void {
    this.requireUpdate(MapView.NeedsProject, true);
  }

  protected didSetProjection(projection: GoogleMapProjection): void {
    this.didObserve(function (viewObserver: GoogleMapViewObserver): void {
      if (viewObserver.viewDidSetProjection) {
        viewObserver.viewDidSetProjection(projection, this);
      }
    });
  }

  get overlay(): google.maps.OverlayView | null {
    return this._overlay;
  }

  get zoom(): number {
    return this._zoom;
  }

  setZoom(newZoom: number): void {
    const oldZoom = this._zoom;
    if (oldZoom !== newZoom) {
      this.willSetZoom(newZoom);
      this._zoom = newZoom;
      this.onSetZoom(newZoom, oldZoom);
      this.didSetZoom(newZoom, oldZoom);
    }
  }

  protected willSetZoom(zoom: number): void {
    this.didObserve(function (viewObserver: GoogleMapViewObserver): void {
      if (viewObserver.viewWillSetZoom) {
        viewObserver.viewWillSetZoom(zoom, this);
      }
    });
  }

  protected onSetZoom(newZoom: number, oldZoom: number): void {
    // hook
  }

  protected didSetZoom(newZoom: number, oldZoom: number): void {
    this.didObserve(function (viewObserver: GoogleMapViewObserver): void {
      if (viewObserver.viewDidSetZoom) {
        viewObserver.viewDidSetZoom(newZoom, oldZoom, this);
      }
    });
  }

  get heading(): number {
    return this._heading;
  }

  get tilt(): number {
    return this._tilt;
  }

  /** @hidden */
  doUpdate(updateFlags: number, viewContext: RenderedViewContext): void {
    const mapViewContext = this.mapViewContext(viewContext);
    this.willUpdate(mapViewContext);
    if (((updateFlags | this._updateFlags) & View.NeedsCompute) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsCompute;
      this.doCompute(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsAnimate) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsAnimate;
      this.doAnimate(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & MapView.NeedsProject) !== 0) {
      this._updateFlags = this._updateFlags & ~MapView.NeedsProject;
      this.doProject(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsLayout) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsLayout;
      this.doLayout(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsScroll) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsScroll;
      this.doScroll(mapViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsRender) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsRender;
      this.doRender(mapViewContext);
    }
    this.onUpdate(viewContext);
    this.doUpdateChildViews(updateFlags, mapViewContext);
    this.didUpdate(mapViewContext);
  }

  childViewContext(childView: View, viewContext: MapViewContext): MapViewContext {
    return viewContext;
  }

  mapViewContext(viewContext: RenderedViewContext): MapViewContext {
    const mapViewContext = Object.create(viewContext);
    mapViewContext.projection = this._projection;
    mapViewContext.zoom = this._zoom;
    mapViewContext.heading = this._heading;
    mapViewContext.tilt = this._tilt;
    return mapViewContext;
  }

  protected onMapRender(): void {
    this._heading = this._map.getHeading();
    this._tilt = this._map.getTilt();
    this.setZoom(this._map.getZoom());
    this.setProjection(this._projection);
  }

  overlayCanvas(): CanvasView | null {
    if (this._parentView) {
      return this.canvasView;
    } else {
      class GoogleMapOverlayView extends google.maps.OverlayView {
        readonly _mapView: GoogleMapView;
        _canvasView: CanvasView | null;
        constructor(mapView: GoogleMapView) {
          super();
          this._mapView = mapView;
          this._canvasView = null;
        }
        onAdd(): void {
          const panes = this.getPanes();
          const overlayMouseTarget = GoogleMapView.materializeAncestors(panes.overlayMouseTarget as HTMLElement);
          const overlayContainer = overlayMouseTarget.parentView as HtmlView;
          const container = overlayContainer.parentView as HtmlView;
          this._canvasView = container.append("canvas");
          this._canvasView.append(this._mapView);
        }
        onRemove(): void {
          if (this._canvasView) {
            this._canvasView.remove();
            this._canvasView = null;
          }
        }
        draw(): void {
          this._mapView.onMapRender();
        }
      }
      const overlay = new GoogleMapOverlayView(this);
      overlay.setMap(this._map);
      this._overlay = overlay;
      return overlay._canvasView;
    }
  }

  private static materializeAncestors(node: HTMLElement): HtmlView {
    const parentNode = node.parentNode;
    if (parentNode instanceof HTMLElement && !(parentNode as ViewHtml).view) {
      GoogleMapView.materializeAncestors(parentNode);
    }
    return View.fromNode(node);
  }
}
