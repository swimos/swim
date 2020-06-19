// Copyright 2015-2020 Swim inc.
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
import {EsriSceneViewProjection} from "./EsriSceneViewProjection";
import {EsriSceneViewController} from "./EsriSceneViewController";

export class EsriSceneView extends EsriView {
  /** @hidden */
  readonly _map: __esri.SceneView;
  /** @hidden */
  _geoProjection: EsriSceneViewProjection;
  /** @hidden */
  _mapZoom: number;
  /** @hidden */
  _mapHeading: number;
  /** @hidden */
  _mapTilt: number;

  constructor(map: __esri.SceneView) {
    super();
    this.onMapRender = this.onMapRender.bind(this);
    this._map = map;
    this._geoProjection = new EsriSceneViewProjection(this._map);
    this._mapZoom = map.zoom;
    this._mapHeading = map.camera.heading;
    this._mapTilt = map.camera.tilt;
    this.initMap(this._map);
  }

  get map(): __esri.SceneView {
    return this._map;
  }

  protected initMap(map: __esri.SceneView): void {
    map.watch("extent", this.onMapRender);
  }

  get viewController(): EsriSceneViewController | null {
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

  get geoProjection(): EsriSceneViewProjection {
    return this._geoProjection;
  }

  setGeoProjection(geoProjection: EsriSceneViewProjection): void {
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
    return this._mapTilt;
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
    this._mapHeading = this._map.camera.heading;
    this._mapTilt = this._map.camera.tilt;
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
      const esriViewSurface = View.fromNode(esriViewRoot.node.querySelector(".esri-view-surface") as HTMLDivElement);
      const canvas = esriViewSurface.append("canvas");
      canvas.append(this);
      return canvas;
    }
  }
}
