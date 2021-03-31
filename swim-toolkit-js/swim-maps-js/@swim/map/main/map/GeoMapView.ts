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
import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import type {GraphicsViewContext} from "@swim/graphics";
import {MapLayerView} from "../layer/MapLayerView";
import type {MapView} from "./MapView";
import type {GeoMapProjection} from "./GeoMapProjection";
import {EquirectangularGeoMapProjection} from "./EquirectangularGeoMapProjection";
import type {GeoMapViewObserver} from "./GeoMapViewObserver";
import type {GeoMapViewController} from "./GeoMapViewController";

export class GeoMapView extends MapLayerView implements MapView {
  constructor(geoProjection: GeoMapProjection) {
    super();
    Object.defineProperty(this, "geoProjection", {
      value: geoProjection,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly viewController: GeoMapViewController | null;

  declare readonly viewObservers: ReadonlyArray<GeoMapViewObserver>;

  project(lnglat: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
    if (arguments.length === 1) {
      return this.geoProjection.project(lng as AnyGeoPoint);
    } else {
      return this.geoProjection.project(lng as number, lat!);
    }
  }

  unproject(point: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyPointR2 | number, y?: number): GeoPoint {
    if (arguments.length === 1) {
      return this.geoProjection.unproject(x as AnyPointR2);
    } else {
      return this.geoProjection.unproject(x as number, y!);
    }
  }

  // @ts-ignore
  declare readonly geoProjection: GeoMapProjection;

  get mapCenter(): GeoPoint {
    return GeoPoint.origin();
  }

  get mapZoom(): number {
    return 0;
  }

  get mapHeading(): number {
    return 0;
  }

  get mapTilt(): number {
    return 0;
  }

  moveTo(mapCenter: AnyGeoPoint | undefined, mapZoom: number | undefined,
         timing?: AnyTiming | boolean): void {
    // nop
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

  get geoFrame(): GeoBox {
    return GeoBox.globe();
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsProject;
    }
    return processFlags;
  }

  protected willProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    super.willProcess(processFlags, viewContext);
    if ((processFlags & View.NeedsProject) !== 0) {
      const oldGeoProjection = this.geoProjection;
      const newGeoProjection = oldGeoProjection.withFrame(this.viewFrame);
      if (oldGeoProjection !== newGeoProjection) {
        Object.defineProperty(this, "geoProjection", {
          value: newGeoProjection,
          enumerable: true,
          configurable: true,
        });
        (viewContext as any).geoProjection = newGeoProjection;
      }
    }
  }

  static create(geoProjection?: GeoMapProjection): GeoMapView {
    if (geoProjection === void 0) {
      geoProjection = new EquirectangularGeoMapProjection(BoxR2.undefined());
    }
    return new GeoMapView(geoProjection);
  }

  static readonly powerFlags: ViewFlags = MapLayerView.powerFlags | View.NeedsProject;
}
