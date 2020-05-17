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
import {View, CanvasView} from "@swim/view";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/map";
import {EsriProjection} from "./EsriProjection";
import {EsriView} from "./EsriView";
import {EsriMapViewProjection} from "./EsriMapViewProjection";
import {EsriMapViewController} from "./EsriMapViewController";

export class EsriMapView extends EsriView {
  /** @hidden */
  readonly _map: __esri.MapView;
  /** @hidden */
  _geoProjection: EsriMapViewProjection;
  /** @hidden */
  _mapZoom: number;
  /** @hidden */
  _mapHeading: number;

  constructor(map: __esri.MapView) {
    super();
    this.onMapRender = this.onMapRender.bind(this);
    this._map = map;
    this._geoProjection = new EsriMapViewProjection(this._map);
    this._mapZoom = map.zoom;
    this._mapHeading = map.rotation;
    this.initMap(this._map);
  }

  get map(): __esri.MapView {
    return this._map;
  }

  protected initMap(map: __esri.MapView): void {
    map.watch("extent", this.onMapRender);
  }

  get viewController(): EsriMapViewController | null {
    return this._viewController;
  }

  project(lnglat: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
    return this._geoProjection.project.apply(this._geoProjection, arguments);
  }

  unproject(point: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyPointR2 | number, y?: number): GeoPoint {
    return this._geoProjection.unproject.apply(this._geoProjection, arguments);
  }

  get geoProjection(): EsriMapViewProjection {
    return this._geoProjection;
  }

  setGeoProjection(geoProjection: EsriMapViewProjection): void {
    this.willSetGeoProjection(geoProjection);
    this._geoProjection = geoProjection;
    this.onSetGeoProjection(geoProjection);
    this.didSetGeoProjection(geoProjection);
  }

  get mapZoom(): number {
    return this._mapZoom;
  }

  setMapZoom(newMapZoom: number): void {
    const oldMapZoom = this._mapZoom;
    if (oldMapZoom !== newMapZoom) {
      this.willSetMapZoom(newMapZoom, oldMapZoom);
      this._mapZoom = newMapZoom;
      this.onSetMapZoom(newMapZoom, oldMapZoom);
      this.didSetMapZoom(newMapZoom, oldMapZoom);
    }
  }

  get mapHeading(): number {
    return this._mapHeading;
  }

  get mapTilt(): number {
    return 0;
  }

  get geoFrame(): GeoBox {
    let extent = this._map.extent;
    if (extent !== null) {
      extent = EsriProjection.webMercatorUtils!.webMercatorToGeographic(extent) as __esri.Extent;
    }
    if (extent !== null) {
      return new GeoBox(extent.xmin, extent.ymin, extent.xmax, extent.ymax);
    } else {
      return GeoBox.globe();
    }
  }

  protected onMapRender(): void {
    this._mapHeading = this._map.rotation;
    this.setMapZoom(this._map.zoom);
    this.setGeoProjection(this._geoProjection);
  }

  overlayCanvas(): CanvasView | null {
    if (this._parentView !== null) {
      return this.canvasView;
    } else {
      const map = this._map;
      const container = View.fromNode(map.container);
      const esriViewRoot = View.fromNode(container.node.querySelector(".esri-view-root") as HTMLDivElement);
      const esriOverlaySurface = View.fromNode(esriViewRoot.node.querySelector(".esri-overlay-surface") as HTMLDivElement);
      const canvas = esriOverlaySurface.append("canvas");
      canvas.setEventSurface(esriViewRoot.node);
      canvas.append(this);
      return canvas;
    }
  }
}
