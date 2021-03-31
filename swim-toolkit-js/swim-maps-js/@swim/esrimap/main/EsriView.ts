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

import type {AnyTiming} from "@swim/mapping";
import type {AnyPointR2, PointR2} from "@swim/math";
import type {AnyGeoPoint, GeoPoint} from "@swim/geo";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import type {GraphicsViewContext, CanvasView} from "@swim/graphics";
import {MapView, MapLayerView} from "@swim/map";
import {EsriProjection} from "./EsriProjection";
import type {EsriViewObserver} from "./EsriViewObserver";
import type {EsriViewController} from "./EsriViewController";

export abstract class EsriView extends MapLayerView implements MapView {
  constructor() {
    super();
    EsriProjection.init();
  }

  declare readonly viewController: EsriViewController | null;

  declare readonly viewObservers: ReadonlyArray<EsriViewObserver>;

  abstract readonly map: __esri.View;

  abstract project(lnglat: AnyGeoPoint): PointR2;
  abstract project(lng: number, lat: number): PointR2;

  abstract unproject(point: AnyPointR2): GeoPoint;
  abstract unproject(x: number, y: number): GeoPoint;

  // @ts-ignore
  abstract readonly geoProjection: EsriProjection;

  declare readonly mapCenter: GeoPoint;

  // @ts-ignore
  abstract readonly mapZoom: number;

  // @ts-ignore
  abstract readonly mapHeading: number;

  // @ts-ignore
  abstract readonly mapTilt: number;

  abstract moveTo(mapCenter: AnyGeoPoint | undefined, mapZoom: number | undefined,
                  timing?: AnyTiming | boolean): void;

  protected mapWillMove(mapCenter: GeoPoint, mapZoom: number): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.mapViewWillMove !== void 0) {
      viewController.mapViewWillMove(mapCenter, mapZoom, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.mapViewWillMove !== void 0) {
        viewObserver.mapViewWillMove(mapCenter, mapZoom, this);
      }
    }
  }

  protected mapDidMove(mapCenter: GeoPoint, mapZoom: number): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!
      if (viewObserver.mapViewDidMove !== void 0) {
        viewObserver.mapViewDidMove(mapCenter, mapZoom, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.mapViewDidMove !== void 0) {
      viewController.mapViewDidMove(mapCenter, mapZoom, this);
    }
  }

  extendViewContext(viewContext: GraphicsViewContext): ViewContextType<this> {
    const mapViewContext = Object.create(viewContext);
    mapViewContext.geoProjection = this.geoProjection;
    mapViewContext.geoFrame = this.geoFrame;
    mapViewContext.mapZoom = this.mapZoom;
    mapViewContext.mapHeading = this.mapHeading;
    mapViewContext.mapTilt = this.mapTilt;
    return mapViewContext;
  }

  abstract overlayCanvas(): CanvasView | null;

  static readonly powerFlags: ViewFlags = MapLayerView.powerFlags | View.NeedsProject;
}
